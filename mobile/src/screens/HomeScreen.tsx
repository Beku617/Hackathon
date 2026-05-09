import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Location from "expo-location";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../navigation/AppNavigator";
import HomeTab from "./homeTabs/HomeTab";
import NewsTab from "./homeTabs/NewsTab";
import ProfileTab from "./homeTabs/ProfileTab";
import RequestTab from "./homeTabs/RequestTab";
import { AuthUser } from "../services/auth";
import {
  CitizenRequestRecord,
  createCitizenRequest,
  getCitizenRequests,
  getHomeStats,
  HomeStatsResponse,
} from "../services/requests";
import {
  clearSessionData,
  getCurrentUser,
  getProfileAvatarUri,
  saveProfileAvatarUri,
} from "../services/session";
import { FONT_SIZE } from "../theme/typography";

type TabKey = "home" | "request" | "news" | "profile";
type NewsFilterKey = "all" | "repair" | "event";

type NewsCard = {
  category: "repair" | "event" | "all";
  categoryLabel: string;
  description: string;
  image: string;
  title: string;
  when: string;
};

type HomeStat = {
  icon:
    | "chart-box-outline"
    | "check-circle-outline"
    | "progress-clock"
    | "message-reply-text-outline";
  iconColor: string;
  label: string;
  value: string;
};

type StatusBreakdown = {
  count: number;
  percent: number;
  status: string;
};

type ProfileMenu = {
  icon: "cog-outline";
  key: "settings";
  label: string;
};

const tabs: {
  key: TabKey;
  icon:
    | "home-outline"
    | "plus-circle-outline"
    | "newspaper-variant-outline"
    | "account-outline";
  label: string;
}[] = [
  { key: "home", icon: "home-outline", label: "Нүүр" },
  { key: "request", icon: "plus-circle-outline", label: "Хүсэлт" },
  { key: "news", icon: "newspaper-variant-outline", label: "Мэдээ" },
  { key: "profile", icon: "account-outline", label: "Профайл" },
];

const newsFilters: { key: NewsFilterKey; label: string }[] = [
  { key: "all", label: "Бүгд" },
  { key: "repair", label: "Засвар" },
  { key: "event", label: "Арга хэмжээ" },
];

const featuredNews = {
  date: "2026.05.20",
  description:
    "Нийслэлийн захиргаанаас ирэх хоёр жилийн хугацаанд 10 шинэ цэцэрлэгт хүрээлэн байгуулна.",
  image:
    "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=1200&q=80",
  title: "ТӨСӨЛ ЭХЭЛЛЭЭ",
  views: "1.2k үзсэн",
};

const newsCards: NewsCard[] = [
  {
    category: "repair",
    categoryLabel: "Дэд бүтэц",
    description:
      "Зам засварын ажил шөнийн цагаар хийгдэж байгаа тул иргэдэд хөдөлгөөний хязгаарлалт үүсэж байна.",
    image:
      "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80",
    title: "Төв замын засвар шинэчлэлийн ажил хуваарийн дагуу үргэлжилж байна",
    when: "2 цагийн өмнө",
  },
  {
    category: "event",
    categoryLabel: "Иргэдийн оролцоо",
    description:
      "Нийт 200 гаруй иргэн оролцож, хорооны орчны тохижилт, цэвэрлэгээний талаар санал солилцлоо.",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
    title: "Хорооны иргэдийн нийтийн хурал амжилттай зохион байгуулагдлаа",
    when: "Өчигдөр",
  },
  {
    category: "all",
    categoryLabel: "Мэдээлэл",
    description:
      "Иргэд төсвийн зарцуулалтын тайланг цахим системээр дамжуулан хянах шинэ боломжтой боллоо.",
    image:
      "https://images.unsplash.com/photo-1551281044-8b00f015f338?auto=format&fit=crop&w=1200&q=80",
    title: "Төсвийн зарцуулалтын тайланг нээлттэй болголоо",
    when: "3 өдрийн өмнө",
  },
  {
    category: "event",
    categoryLabel: "Арга хэмжээ",
    description:
      "Ирэх амралтын өдрүүдэд зохион байгуулах бүх нийтийн цэвэрлэгээнд байгууллага, иргэдийг оролцохыг урив.",
    image:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80",
    title: '"Цэвэр хот" өдөрлөгт нэгдэхийг урьж байна',
    when: "4 өдрийн өмнө",
  },
];

const trendBars = [
  { day: "Дав", height: 62, active: false },
  { day: "Мяг", height: 98, active: false },
  { day: "Лха", height: 130, active: false },
  { day: "Пүр", height: 152, active: true },
  { day: "Баа", height: 112, active: false },
  { day: "Бям", height: 84, active: false },
  { day: "Ням", height: 138, active: false },
] as const;

const statusColorMap: Record<string, string> = {
  "\u0448\u0438\u0439\u0434\u0432\u044d\u0440\u043b\u044d\u0441\u044d\u043d":
    "#2E7D32",
  "\u0445\u044f\u043d\u0430\u0433\u0434\u0430\u0436 \u0431\u0443\u0439":
    "#C62828",
  "\u0445\u0430\u0440\u0438\u0443 \u04e9\u0433\u0441\u04e9\u043d": "#1E88E5",
  "\u0445\u0443\u0432\u0438\u0430\u0440\u043b\u0430\u0433\u0434\u0430\u0430\u0433\u04af\u0439":
    "#EF6C00",
};

const defaultHomeStats: HomeStatsResponse = {
  inReviewRequests: 0,
  resolvedRequests: 0,
  respondedPercent: 0,
  statusBreakdown: [],
  totalRequests: 0,
};

const recentDecisions = [
  {
    date: "Өнөөдөр, 14:20",
    description:
      "Иргэдийн хүсэлтийн дагуу эвдрэлтэй байсан 200м автозамын хэсгийг засварлав.",
    image:
      "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=420&q=80",
    status: "Шийдвэрлэсэн",
    statusBg: "#1D7F39",
    title: "Баянзүрх дүүрэг: 15-р хорооны зам засвар",
  },
  {
    date: "Өчигдөр, 09:15",
    description:
      "8-р хорооны тоглоомын талбайн тохижилтын ажил төлөвлөлтийн шатанд орлоо.",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=420&q=80",
    status: "Хянагдаж буй",
    statusBg: "#B45A0A",
    title: "Сүхбаатар дүүрэг: Хүүхдийн тоглоомын талбай",
  },
] as const;

const profileMenus: ProfileMenu[] = [
  { icon: "cog-outline", key: "settings", label: "Тохиргоо" },
];

type ProfileRequestCard = {
  attachments: CitizenRequestRecord["attachments"];
  date: string;
  description: string;
  id: string;
  status: string;
  statusBg: string;
  statusColor: string;
  title: string;
};

const normalizeStatus = (status: string): string => status.trim().toLowerCase();

const resolvedStatus = "\u0448\u0438\u0439\u0434\u0432\u044d\u0440\u043b\u044d\u0441\u044d\u043d";
const inReviewStatus = "\u0445\u044f\u043d\u0430\u0433\u0434\u0430\u0436 \u0431\u0443\u0439";
const respondedStatus = "\u0445\u0430\u0440\u0438\u0443 \u04e9\u0433\u0441\u04e9\u043d";

const getProfileStatusStyle = (
  status: string,
): { statusBg: string; statusColor: string; title: string } => {
  const normalized = normalizeStatus(status);

  if (normalized === "resolved" || normalized === resolvedStatus) {
    return {
      statusBg: "#DFE8DE",
      statusColor: "#1D7A35",
      title: "\u0428\u0438\u0439\u0434\u0432\u044d\u0440\u043b\u044d\u0441\u044d\u043d",
    };
  }

  if (normalized === "in_review" || normalized === inReviewStatus) {
    return {
      statusBg: "#EFE7DE",
      statusColor: "#A85807",
      title: "\u0425\u044f\u043d\u0430\u0433\u0434\u0430\u0436 \u0431\u0443\u0439",
    };
  }

  if (normalized === "responded" || normalized === respondedStatus) {
    return {
      statusBg: "#DDE9F8",
      statusColor: "#1E5FAF",
      title: "\u0425\u0430\u0440\u0438\u0443 \u04e9\u0433\u0441\u04e9\u043d",
    };
  }

  return {
    statusBg: "#E6E6E6",
    statusColor: "#565656",
    title: "\u0425\u0443\u0432\u0430\u0430\u0440\u043b\u0430\u0433\u0434\u0430\u0430\u0433\u04af\u0439",
  };
};
const formatProfileRequestDate = (date?: string): string => {
  if (!date) return "-";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toISOString().slice(0, 10).replace(/-/g, ".");
};

const requestTypePlaceholder = "Сонгоно уу...";
const requestTypeOptions = ["Явган хүний зам", "Машиний зам"] as const;
type RequestTypeOption = (typeof requestTypeOptions)[number];
const locationPlaceholder = "Сонгоно уу...";
const districtLocationOptions = [
  "Баянгол",
  "Баянзүрх",
  "Сүхбаатар",
  "Чингэлтэй",
  "Хан-Уул",
  "Сонгинохайрхан",
  "Налайх",
  "Багануур",
  "Багахангай",
] as const;
const gpsLocationOption = "📍 Одоогийн байршил (GPS)" as const;
const requestLocationOptions = [
  ...districtLocationOptions,
  gpsLocationOption,
] as const;
type DistrictLocationOption = (typeof districtLocationOptions)[number];
type RequestLocationOption = (typeof requestLocationOptions)[number];
type RequestLocationValue =
  | DistrictLocationOption
  | { latitude: number; longitude: number };
type RequestFileKind = "image" | "pdf";

type RequestAttachment = {
  id: string;
  kind: RequestFileKind | null;
  mimeType?: string;
  name: string;
  size?: number;
  uri: string;
};

const MB = 1024 * 1024;
const MAX_ATTACHMENT_SIZE_BYTES = 10 * MB;
const SUCCESS_BANNER_DURATION_MS = 2200;

const imageExtensions = new Set(["png", "jpg", "jpeg"]);
const pdfExtensions = new Set(["pdf"]);

const getFileExtension = (name: string): string => {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] ?? "" : "";
};

const getFileNameFromUri = (uri: string): string => {
  const segments = uri.split("/");
  return segments[segments.length - 1] || "file";
};

const getFileNameFromRemoteUrl = (url: string): string => {
  const cleanUrl = url.split("?")[0] || url;
  return getFileNameFromUri(cleanUrl);
};

const isImageAttachmentUrl = (url: string): boolean =>
  /\.(png|jpe?g)$/i.test(getFileNameFromRemoteUrl(url));

const getAttachmentKind = (name: string, mimeType?: string): RequestFileKind | null => {
  const extension = getFileExtension(name);
  const normalizedMime = mimeType?.toLowerCase() ?? "";

  if (
    normalizedMime.startsWith("image/") ||
    imageExtensions.has(extension)
  ) {
    return "image";
  }

  if (
    normalizedMime === "application/pdf" ||
    normalizedMime.endsWith("/pdf") ||
    pdfExtensions.has(extension)
  ) {
    return "pdf";
  }

  return null;
};

const formatBytes = (value?: number): string => {
  if (!value || value <= 0) return "Хэмжээ тодорхойгүй";

  if (value >= MB) {
    return `${(value / MB).toFixed(2)} MB`;
  }

  return `${Math.max(1, Math.round(value / 1024))} KB`;
};

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [activeFilter, setActiveFilter] = useState<NewsFilterKey>("all");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [profileAvatarUri, setProfileAvatarUri] = useState<string | null>(null);
  const [profileRequests, setProfileRequests] = useState<CitizenRequestRecord[]>(
    [],
  );
  const [homeStatsData, setHomeStatsData] =
    useState<HomeStatsResponse>(defaultHomeStats);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [isProfileRequestsLoading, setIsProfileRequestsLoading] = useState(false);
  const [isSettingsScreenOpen, setIsSettingsScreenOpen] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
    useState(true);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] =
    useState(false);
  const [requestType, setRequestType] = useState<RequestTypeOption | "">("");
  const [isRequestTypeOpen, setIsRequestTypeOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedRequestLocationOption, setSelectedRequestLocationOption] =
    useState<RequestLocationOption | "">("");
  const [requestLocationValue, setRequestLocationValue] =
    useState<RequestLocationValue | null>(null);
  const [requestDetails, setRequestDetails] = useState("");
  const [requestAttachments, setRequestAttachments] = useState<RequestAttachment[]>(
    [],
  );
  const [requestAttachmentError, setRequestAttachmentError] = useState("");
  const [isAttachmentPickerVisible, setIsAttachmentPickerVisible] =
    useState(false);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [showSubmitSuccessToast, setShowSubmitSuccessToast] = useState(false);
  const isRequestTab = activeTab === "request";
  const isHomeOrProfile = activeTab === "home" || activeTab === "profile";
  const isNoStatsData =
    !isStatsLoading && homeStatsData.statusBreakdown.length === 0;

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const [storedUser, storedAvatarUri] = await Promise.all([
          getCurrentUser(),
          getProfileAvatarUri(),
        ]);
        if (isMounted) {
          setCurrentUser(storedUser);
          setProfileAvatarUri(storedAvatarUri);
        }
      } catch {
        if (isMounted) {
          setCurrentUser(null);
          setProfileAvatarUri(null);
        }
      }
    };

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadProfileRequests = async (userId?: string) => {
    setIsProfileRequestsLoading(true);
    try {
      const response = await getCitizenRequests(userId);
      setProfileRequests(response.requests);
    } catch {
      setProfileRequests([]);
    } finally {
      setIsProfileRequestsLoading(false);
    }
  };

  useEffect(() => {
    const userIdFilter =
      currentUser?.role === "admin" ? undefined : currentUser?.id;
    void loadProfileRequests(userIdFilter);
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    if (activeTab !== "profile") {
      setIsSettingsScreenOpen(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!showSubmitSuccessToast) {
      return;
    }

    const timerId = setTimeout(() => {
      setShowSubmitSuccessToast(false);
    }, SUCCESS_BANNER_DURATION_MS);

    return () => {
      clearTimeout(timerId);
    };
  }, [showSubmitSuccessToast]);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      setIsStatsLoading(true);
      try {
        const stats = await getHomeStats();
        if (isMounted) {
          setHomeStatsData(stats);
        }
      } catch {
        if (isMounted) {
          setHomeStatsData(defaultHomeStats);
        }
      } finally {
        if (isMounted) {
          setIsStatsLoading(false);
        }
      }
    };

    void loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredNews = useMemo(() => {
    if (activeFilter === "all") return newsCards;
    return newsCards.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  const reportCards = useMemo<HomeStat[]>(() => {
    const formatCount = (value: number): string =>
      value.toLocaleString("en-US");
    const formatPercent = (value: number): string =>
      `${Number.isInteger(value) ? value : value.toFixed(1)}%`;

    return [
      {
        icon: "chart-box-outline",
        iconColor: "#2E7D32",
        label: "Нийт хүсэлт",
        value: formatCount(homeStatsData.totalRequests),
      },
      {
        icon: "check-circle-outline",
        iconColor: "#2E7D32",
        label: "Шийдвэрлэсэн",
        value: formatCount(homeStatsData.resolvedRequests),
      },
      {
        icon: "progress-clock",
        iconColor: "#C62828",
        label: "Хянагдаж буй",
        value: formatCount(homeStatsData.inReviewRequests),
      },
      {
        icon: "message-reply-text-outline",
        iconColor: "#1E88E5",
        label: "Хариу өгсөн%",
        value: formatPercent(homeStatsData.respondedPercent),
      },
    ];
  }, [homeStatsData]);

  const statusBreakdown = useMemo<StatusBreakdown[]>(() => {
    return homeStatsData.statusBreakdown.map((item) => ({
      count: item.count,
      percent: item.percent,
      status: item.status,
    }));
  }, [homeStatsData.statusBreakdown]);

  const profileDisplayName = currentUser?.name?.trim() || "Хэрэглэгч";
  const profileEmail = currentUser?.email?.trim() || "-";
  const profilePhone = currentUser?.phone?.trim() || "-";
  const profileRequestCards = useMemo<ProfileRequestCard[]>(() => {
    const isAdminUser = currentUser?.role === "admin";
    const userId = currentUser?.id?.trim();
    const userEmail = currentUser?.email?.trim().toLowerCase();

    return profileRequests
      .filter((item) => {
        if (isAdminUser) {
          return true;
        }
        if (userId && item.userId) {
          return item.userId.trim() === userId;
        }

        if (userId && !item.userId) {
          return false;
        }

        if (!userId && userEmail) {
          return item.email.trim().toLowerCase() === userEmail;
        }

        return false;
      })
      .map((item) => {
        const statusInfo = getProfileStatusStyle(item.status);

        return {
          attachments: item.attachments || [],
          date: formatProfileRequestDate(item.createdAt),
          description: item.details,
          id: item.id,
          status: statusInfo.title,
          statusBg: statusInfo.statusBg,
          statusColor: statusInfo.statusColor,
          title: item.requestType || item.type || "Хүсэлт",
        };
      });
  }, [currentUser?.email, currentUser?.id, currentUser?.role, profileRequests]);
  const hasNoProfileRequests =
    !isProfileRequestsLoading && profileRequestCards.length === 0;

  const handlePickProfileAvatar = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Зөвшөөрөл хэрэгтэй",
          "Профайл зураг сонгохын тулд медиа санд хандах зөвшөөрөл өгнө үү.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: ["images"],
        quality: 0.8,
      });

      if (result.canceled || !result.assets.length || !result.assets[0]?.uri) {
        return;
      }

      const selectedUri = result.assets[0].uri;
      setProfileAvatarUri(selectedUri);
      await saveProfileAvatarUri(selectedUri);
    } catch {
      Alert.alert(
        "Алдаа гарлаа",
        "Зураг сонгох үед алдаа гарлаа. Дахин оролдоно уу.",
      );
    }
  };

  const appendRequestAttachments = (attachments: RequestAttachment[]) => {
    if (!attachments.length) return;

    const validationErrors: string[] = [];
    const validAttachments: RequestAttachment[] = [];

    attachments.forEach((attachment) => {
      if (!attachment.kind) {
        validationErrors.push(
          `${attachment.name}: Only PNG, JPG, PDF files are allowed.`,
        );
        return;
      }

      if (
        typeof attachment.size === "number" &&
        attachment.size > MAX_ATTACHMENT_SIZE_BYTES
      ) {
        validationErrors.push(`${attachment.name}: exceeds 10MB limit.`);
        return;
      }

      validAttachments.push(attachment);
    });

    setRequestAttachmentError(validationErrors.join("\n"));

    if (validAttachments.length > 0) {
      setRequestAttachments((prev) => {
        const existing = new Set(prev.map((item) => `${item.uri}:${item.name}`));
        const merged = [...prev];

        validAttachments.forEach((attachment) => {
          const key = `${attachment.uri}:${attachment.name}`;
          if (!existing.has(key)) {
            existing.add(key);
            merged.push(attachment);
          }
        });

        return merged;
      });
    }
  };

  const handlePickMediaFiles = async () => {
    setIsAttachmentPickerVisible(false);
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow media library access to select images.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        mediaTypes: ["images"],
        quality: 1,
        selectionLimit: 0,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const attachments = result.assets
        .filter((asset) => Boolean(asset.uri))
        .map((asset, index) => {
          const name =
            asset.fileName?.trim() || getFileNameFromUri(asset.uri) || "file";

          return {
            id: `${asset.uri}-${Date.now()}-${index}`,
            kind: getAttachmentKind(name, asset.mimeType ?? undefined),
            mimeType: asset.mimeType ?? undefined,
            name,
            size: asset.fileSize ?? undefined,
            uri: asset.uri,
          };
        });

      appendRequestAttachments(attachments);
    } catch {
      Alert.alert(
        "Error",
        "Failed to pick image. Please try again.",
      );
    }
  };

  const handlePickDocumentFiles = async () => {
    setIsAttachmentPickerVisible(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: true,
        type: "application/pdf",
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const attachments = result.assets
        .filter((asset) => Boolean(asset.uri))
        .map((asset, index) => ({
          id: `${asset.uri}-${Date.now()}-${index}`,
          kind: getAttachmentKind(asset.name, asset.mimeType),
          mimeType: asset.mimeType,
          name: asset.name,
          size: asset.size,
          uri: asset.uri,
        }));

      appendRequestAttachments(attachments);
    } catch {
      Alert.alert(
        "Error",
        "Failed to pick PDF document. Please try again.",
      );
    }
  };

  const handleSelectRequestFiles = () => {
    setIsAttachmentPickerVisible(true);
  };

  const handleRemoveRequestAttachment = (attachmentId: string) => {
    setRequestAttachments((prev) =>
      prev.filter((item) => item.id !== attachmentId),
    );
  };

  const handleOpenPdfAttachment = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Cannot open",
        "Failed to open PDF attachment. Please try again.",
      );
    }
  };

  const formatRequestLocation = (location: RequestLocationValue): string => {
    if (typeof location === "string") return location;
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  const handleSelectRequestLocation = async (
    option: RequestLocationOption,
  ): Promise<void> => {
    setIsLocationOpen(false);

    if (option !== gpsLocationOption) {
      setSelectedRequestLocationOption(option);
      setRequestLocationValue(option);
      return;
    }

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Зөвшөөрөл хэрэгтэй",
          "Одоогийн байршил авахын тулд байршлын зөвшөөрөл өгнө үү.",
        );
        setSelectedRequestLocationOption("");
        setRequestLocationValue(null);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setSelectedRequestLocationOption(option);
      setRequestLocationValue({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch {
      Alert.alert(
        "Алдаа гарлаа",
        "Одоогийн байршил тодорхойлох үед алдаа гарлаа. Дахин оролдоно уу.",
      );
      setSelectedRequestLocationOption("");
      setRequestLocationValue(null);
    }
  };

  const handleLogout = () => {
    Alert.alert("Системээс гарах", "Та системээс гарахдаа итгэлтэй байна уу?", [
      { text: "Болих", style: "cancel" },
      {
        text: "Гарах",
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              await clearSessionData();
              setCurrentUser(null);
              setProfileAvatarUri(null);
              setProfileRequests([]);
              setIsSettingsScreenOpen(false);
              setActiveTab("home");
              setRequestType("");
              setIsRequestTypeOpen(false);
              setIsLocationOpen(false);
              setSelectedRequestLocationOption("");
              setRequestLocationValue(null);
              setRequestDetails("");
              setRequestAttachments([]);

              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } catch {
              Alert.alert(
                "Алдаа гарлаа",
                "Системээс гарах үед алдаа гарлаа. Дахин оролдоно уу.",
              );
            }
          })();
        },
      },
    ]);
  };

  const handleSubmitRequest = async () => {
    if (submittingRequest) return;

    const profile = currentUser ?? (await getCurrentUser());
    if (!profile?.name || !profile?.email || !profile?.phone) {
      Alert.alert(
        "Мэдээлэл дутуу",
        "Хүсэлт илгээхийн тулд нэвтэрсэн хэрэглэгчийн овог нэр, и-мэйл, утасны дугаар байх шаардлагатай.",
      );
      return;
    }

    const selectedRequestType = requestType.trim();
    if (!selectedRequestType) {
      Alert.alert("Мэдээлэл дутуу", "Хүсэлтийн төрлөө сонгоно уу.");
      return;
    }

    if (!requestLocationValue) {
      Alert.alert("Мэдээлэл дутуу", "Хаяг / байршлаа сонгоно уу.");
      return;
    }

    setSubmittingRequest(true);
    try {
      const normalizedLocation = formatRequestLocation(requestLocationValue);
      const detailText = requestDetails.trim();
      const locationDetails =
        typeof requestLocationValue === "string"
          ? `Хаяг: ${normalizedLocation}`
          : `Хаяг: ${gpsLocationOption} (${normalizedLocation})`;
      const detailsPayload = [detailText, locationDetails]
        .filter(Boolean)
        .join("\n\n");

      const payload = {
        attachments: requestAttachments
          .filter((attachment) => Boolean(attachment.kind))
          .map((attachment) => ({
            mimeType: attachment.mimeType,
            name: attachment.name,
            uri: attachment.uri,
          })),
        fullName: profile.name,
        email: profile.email,
        phone: profile.phone,
        requestType: selectedRequestType,
        type: selectedRequestType,
        details: detailsPayload,
        userId: profile.id,
      };

      await createCitizenRequest(payload);
      setShowSubmitSuccessToast(true);
      setRequestType("");
      setIsRequestTypeOpen(false);
      setIsLocationOpen(false);
      setSelectedRequestLocationOption("");
      setRequestLocationValue(null);
      setRequestDetails("");
      setRequestAttachments([]);
      setRequestAttachmentError("");
      setIsAttachmentPickerVisible(false);
      void loadProfileRequests(profile.id);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Request submission failed. Please try again.";
      Alert.alert("Request submission error", message);
    } finally {
      setSubmittingRequest(false);
    }
  };

  const renderTabContent = () => {
    if (activeTab === "home") {
      return (
        <HomeTab
          isNoStatsData={isNoStatsData}
          isStatsLoading={isStatsLoading}
          onPressNewRequest={() => setActiveTab("request")}
          recentDecisions={recentDecisions}
          reportCards={reportCards}
          statusBreakdown={statusBreakdown}
          statusColorMap={statusColorMap}
          styles={styles}
          trendBars={trendBars}
        />
      );
    }

    if (activeTab === "request") {
      return (
        <RequestTab
          formatBytes={formatBytes}
          handleSelectRequestLocation={(option) =>
            handleSelectRequestLocation(option as RequestLocationOption)
          }
          isLocationOpen={isLocationOpen}
          isRequestTypeOpen={isRequestTypeOpen}
          locationPlaceholder={locationPlaceholder}
          onRemoveRequestAttachment={handleRemoveRequestAttachment}
          onSelectRequestFiles={handleSelectRequestFiles}
          onSetRequestDetails={setRequestDetails}
          onSetRequestType={(value) => {
            setRequestType(value as RequestTypeOption);
            setIsRequestTypeOpen(false);
          }}
          onSubmitRequest={() => void handleSubmitRequest()}
          onToggleLocationOpen={() => setIsLocationOpen((prev) => !prev)}
          onToggleRequestTypeOpen={() => setIsRequestTypeOpen((prev) => !prev)}
          requestAttachmentError={requestAttachmentError}
          requestAttachments={requestAttachments}
          requestDetails={requestDetails}
          requestLocationOptions={requestLocationOptions}
          requestType={requestType}
          requestTypeOptions={requestTypeOptions}
          requestTypePlaceholder={requestTypePlaceholder}
          selectedRequestLocationOption={selectedRequestLocationOption}
          styles={styles}
          submittingRequest={submittingRequest}
        />
      );
    }

    if (activeTab === "profile") {
      return (
        <ProfileTab
          currentUserRole={currentUser?.role}
          emailNotificationsEnabled={emailNotificationsEnabled}
          getFileNameFromRemoteUrl={getFileNameFromRemoteUrl}
          handleLogout={handleLogout}
          handleOpenPdfAttachment={handleOpenPdfAttachment}
          hasNoProfileRequests={hasNoProfileRequests}
          isImageAttachmentUrl={isImageAttachmentUrl}
          isProfileRequestsLoading={isProfileRequestsLoading}
          isSettingsScreenOpen={isSettingsScreenOpen}
          onCloseSettings={() => setIsSettingsScreenOpen(false)}
          onOpenSettings={() => setIsSettingsScreenOpen(true)}
          onPickProfileAvatar={() => void handlePickProfileAvatar()}
          onSetEmailNotificationsEnabled={setEmailNotificationsEnabled}
          onSetPreviewImageUri={setPreviewImageUri}
          onSetPushNotificationsEnabled={setPushNotificationsEnabled}
          profileAvatarUri={profileAvatarUri}
          profileDisplayName={profileDisplayName}
          profileEmail={profileEmail}
          profileMenus={profileMenus}
          profilePhone={profilePhone}
          profileRequestCards={profileRequestCards}
          pushNotificationsEnabled={pushNotificationsEnabled}
          styles={styles}
        />
      );
    }

    return (
      <NewsTab
        activeFilter={activeFilter}
        featuredNews={featuredNews}
        filteredNews={filteredNews}
        newsFilters={newsFilters}
        onSetActiveFilter={(key) => setActiveFilter(key as NewsFilterKey)}
        styles={styles}
      />
    );
  };

  const renderHeaderRight = () => {
    if (isRequestTab) {
      return null;
    }

    if (isHomeOrProfile) {
      return (
        <Pressable hitSlop={8} style={styles.headerAction}>
          <Feather color="#151515" name="bell" size={22} />
        </Pressable>
      );
    }

    return (
      <View style={styles.headerActions}>
        <Pressable hitSlop={8} style={styles.headerAction}>
          <Feather color="#151515" name="search" size={19} />
        </Pressable>
        <Pressable hitSlop={8} style={styles.headerAction}>
          <Feather color="#151515" name="bell" size={18} />
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <MaterialCommunityIcons
              color="#2E7D32"
              name="bank-outline"
              size={22}
            />
            <Text style={styles.headerTitle}>22 22</Text>
          </View>

          {renderHeaderRight()}
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {renderTabContent()}
        </ScrollView>

        <View style={styles.bottomTab}>
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;

            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={styles.tabItem}
              >
                <View
                  style={[
                    styles.tabContent,
                    isActive ? styles.tabContentActive : undefined,
                  ]}
                >
                  <MaterialCommunityIcons
                    color={isActive ? "#0C3875" : "#273327"}
                    name={tab.icon}
                    size={23}
                  />
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.tabLabel,
                      isActive ? styles.tabLabelActive : undefined,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Modal
          transparent
          animationType="fade"
          visible={isAttachmentPickerVisible}
          onRequestClose={() => setIsAttachmentPickerVisible(false)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsAttachmentPickerVisible(false)}
          >
            <View style={styles.attachmentPickerSheet}>
              <Text style={styles.attachmentPickerTitle}>
                {"\u0424\u0430\u0439\u043b \u0441\u043e\u043d\u0433\u043e\u0445"}
              </Text>
              <Pressable
                style={styles.attachmentPickerOption}
                onPress={() => void handlePickMediaFiles()}
              >
                <MaterialCommunityIcons
                  color="#0B6C2C"
                  name="image-outline"
                  size={22}
                />
                <Text style={styles.attachmentPickerOptionText}>
                  {"\u0417\u0443\u0440\u0430\u0433 \u0441\u043e\u043d\u0433\u043e\u0445"}
                </Text>
              </Pressable>
              <Pressable
                style={styles.attachmentPickerOption}
                onPress={() => void handlePickDocumentFiles()}
              >
                <MaterialCommunityIcons
                  color="#0B6C2C"
                  name="file-pdf-box"
                  size={22}
                />
                <Text style={styles.attachmentPickerOptionText}>
                  {
                    "\u0411\u0430\u0440\u0438\u043c\u0442 (PDF) \u0441\u043e\u043d\u0433\u043e\u0445"
                  }
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        <Modal
          transparent
          animationType="fade"
          visible={Boolean(previewImageUri)}
          onRequestClose={() => setPreviewImageUri(null)}
        >
          <View style={styles.imagePreviewOverlay}>
            <Pressable
              hitSlop={8}
              onPress={() => setPreviewImageUri(null)}
              style={styles.imagePreviewCloseButton}
            >
              <Feather color="#FFFFFF" name="x" size={24} />
            </Pressable>
            {previewImageUri ? (
              <Image
                resizeMode="contain"
                source={{ uri: previewImageUri }}
                style={styles.imagePreviewFull}
              />
            ) : null}
          </View>
        </Modal>

        {showSubmitSuccessToast ? (
          <View style={styles.successToast}>
            <MaterialCommunityIcons
              color="#FFFFFF"
              name="check-circle-outline"
              size={20}
            />
            <Text style={styles.successToastText}>{"\u0425\u04af\u0441\u044d\u043b\u0442 \u0430\u043c\u0436\u0438\u043b\u0442\u0442\u0430\u0439 \u0438\u043b\u0433\u044d\u044d\u0433\u0434\u043b\u044d\u044d"}</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#F3F4F3",
    flex: 1,
  },
  screen: {
    backgroundColor: "#F3F4F3",
    flex: 1,
  },
  header: {
    alignItems: "center",
    backgroundColor: "#F3F4F3",
    borderBottomColor: "#CDD4CD",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerTitleWrap: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  headerTitle: {
    color: "#2E7D32",
    fontSize: FONT_SIZE.title,
    fontWeight: "800",
    lineHeight: 30,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  headerAction: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  content: {
    paddingBottom: 0,
    paddingHorizontal: 14,
    paddingTop: 14,
  },

  heroCard: {
    backgroundColor: "#2E7D32",
    borderColor: "#256A2A",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    overflow: "hidden",
    paddingBottom: 15,
    paddingHorizontal: 18,
    paddingTop: 18,
    position: "relative",
  },
  heroTitle: {
    color: "#E8FAE8",
    fontSize: FONT_SIZE.title,
    fontWeight: "700",
    marginBottom: 8,
  },
  heroDescription: {
    color: "#D6F5D7",
    fontSize: FONT_SIZE.body,
    lineHeight: 27,
    maxWidth: "76%",
    zIndex: 1,
  },
  heroButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#A8F0AB",
    borderRadius: 25,
    marginTop: 15,
    minWidth: 174,
    paddingHorizontal: 18,
    paddingVertical: 12,
    zIndex: 1,
  },
  heroButtonText: {
    color: "#0A5A1F",
    fontSize: FONT_SIZE.button,
    fontWeight: "700",
  },
  heroWatermark: {
    bottom: -16,
    position: "absolute",
    right: -9,
  },
  reportHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    marginTop: 2,
  },
  reportTitle: {
    color: "#1B1B1B",
    fontSize: FONT_SIZE.title,
    fontWeight: "800",
  },
  reportPeriod: {
    color: "#5E5E5E",
    fontSize: FONT_SIZE.label,
    marginBottom: 0,
  },
  reportGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  reportCard: {
    backgroundColor: "#F7F7F7",
    borderColor: "#C6CEC6",
    borderRadius: 14,
    borderWidth: 1,
    elevation: 2,
    minHeight: 112,
    paddingBottom: 10,
    paddingHorizontal: 14,
    paddingTop: 11,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 7,
    width: "48.5%",
  },
  reportValue: {
    color: "#111111",
    fontSize: FONT_SIZE.body,
    fontWeight: "700",
    marginTop: 5,
  },
  reportLabel: {
    color: "#4A4A4A",
    fontSize: FONT_SIZE.label,
    marginTop: 2,
  },
  cardTitle: {
    color: "#1A1A1A",
    fontSize: FONT_SIZE.title,
    fontWeight: "800",
    marginBottom: 14,
  },
  trendCard: {
    backgroundColor: "#F7F7F7",
    borderColor: "#C6CEC6",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    paddingBottom: 11,
    paddingHorizontal: 14,
    paddingTop: 13,
  },
  barsRow: {
    alignItems: "flex-end",
    borderBottomColor: "#D6D9D6",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "space-between",
    paddingBottom: 9,
  },
  barItem: {
    alignItems: "center",
    flex: 1,
  },
  bar: {
    borderRadius: 1,
    width: "100%",
  },
  barLabel: {
    color: "#343434",
    fontSize: FONT_SIZE.label,
    marginTop: 9,
  },
  categoryCard: {
    backgroundColor: "#F7F7F7",
    borderColor: "#C6CEC6",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 18,
    paddingBottom: 11,
    paddingHorizontal: 14,
    paddingTop: 13,
  },
  progressRow: {
    marginBottom: 12,
  },
  progressHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  progressLabel: {
    color: "#292929",
    fontSize: FONT_SIZE.body,
  },
  progressPercent: {
    color: "#1A1A1A",
    fontSize: FONT_SIZE.label,
    fontWeight: "700",
  },
  progressTrack: {
    backgroundColor: "#E5E5E5",
    borderRadius: 999,
    height: 8,
    overflow: "hidden",
  },
  progressFill: {
    borderRadius: 999,
    height: "100%",
  },
  emptyStateText: {
    color: "#666666",
    fontSize: FONT_SIZE.label,
    marginTop: 4,
  },
  recentHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  recentTitle: {
    color: "#101010",
    flex: 1,
    fontSize: FONT_SIZE.title,
    fontWeight: "700",
    lineHeight: 42,
    marginRight: 10,
  },
  recentAction: {
    color: "#1A59C5",
    fontSize: FONT_SIZE.button,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 3,
    textAlign: "right",
  },
  recentCard: {
    backgroundColor: "#F7F7F7",
    borderColor: "#C6CEC6",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  recentImage: {
    borderRadius: 9,
    height: 100,
    width: 100,
  },
  recentContent: {
    flex: 1,
    marginLeft: 12,
  },
  recentTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  recentCardTitle: {
    color: "#111111",
    flex: 1,
    fontSize: FONT_SIZE.title,
    fontWeight: "700",
    lineHeight: 22,
    marginRight: 8,
  },
  recentStatusPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  recentStatusText: {
    color: "#FFFFFF",
    fontSize: FONT_SIZE.label,
    fontWeight: "700",
  },
  recentDescription: {
    color: "#575757",
    fontSize: FONT_SIZE.body,
    lineHeight: 20,
    marginBottom: 6,
  },
  recentDateRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  recentDateText: {
    color: "#737373",
    fontSize: FONT_SIZE.label,
  },

  requestLeadTitle: {
    color: "#101010",
    fontSize: FONT_SIZE.title,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  requestLeadDescription: {
    color: "#272727",
    fontSize: FONT_SIZE.body,
    lineHeight: 30,
    marginBottom: 6,
    marginTop: 14,
  },
  requestFormCard: {
    backgroundColor: "#F7F8F7",
    borderColor: "#BAC4B9",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  formField: {
    marginBottom: 16,
  },
  formFieldDropdownOpen: {
    zIndex: 20,
  },
  formLabel: {
    color: "#222222",
    fontSize: FONT_SIZE.label,
    letterSpacing: 0.3,
    marginBottom: 7,
  },
  formInput: {
    backgroundColor: "#FAFAFA",
    borderColor: "#B8C2B7",
    borderRadius: 11,
    borderWidth: 1,
    color: "#1D1D1D",
    fontSize: FONT_SIZE.body,
    height: 52,
    paddingHorizontal: 16,
  },
  selectInput: {
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderColor: "#B8C2B7",
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: "row",
    height: 52,
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  selectWrap: {
    position: "relative",
  },
  selectText: {
    color: "#141414",
    fontSize: FONT_SIZE.body,
  },
  selectOptions: {
    backgroundColor: "#FAFAFA",
    borderColor: "#B8C2B7",
    borderRadius: 11,
    borderWidth: 1,
    elevation: 8,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    right: 0,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    top: 60,
    zIndex: 25,
  },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectOptionBorder: {
    borderBottomColor: "#D5DDD4",
    borderBottomWidth: 1,
  },
  selectOptionText: {
    color: "#1D1D1D",
    fontSize: FONT_SIZE.body,
  },
  selectOptionTextActive: {
    color: "#056D1E",
    fontWeight: "700",
  },
  formTextarea: {
    height: 156,
    lineHeight: 24,
    paddingTop: 14,
  },
  uploadArea: {
    alignItems: "center",
    borderColor: "#B2C3B2",
    borderRadius: 14,
    borderStyle: "dashed",
    borderWidth: 1.5,
    justifyContent: "center",
    minHeight: 176,
    paddingHorizontal: 14,
    paddingVertical: 18,
  },
  uploadTapArea: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  uploadLead: {
    color: "#191919",
    fontSize: FONT_SIZE.body,
    lineHeight: 24,
    marginTop: 10,
  },
  uploadAction: {
    color: "#085BC0",
    fontSize: FONT_SIZE.button,
    fontWeight: "700",
    marginBottom: 5,
    marginTop: 2,
  },
  uploadFormats: {
    color: "#2E2E2E",
    fontSize: FONT_SIZE.label,
    letterSpacing: 0.6,
    textAlign: "center",
  },
  uploadErrorText: {
    color: "#A11E1E",
    fontSize: FONT_SIZE.label,
    marginTop: 8,
  },
  uploadList: {
    gap: 8,
    marginTop: 10,
  },
  uploadItemRow: {
    alignItems: "center",
    backgroundColor: "#F1F5F1",
    borderColor: "#D2DDD2",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  uploadImageThumb: {
    borderRadius: 8,
    height: 48,
    width: 48,
  },
  uploadDocIconWrap: {
    alignItems: "center",
    backgroundColor: "#E5ECE5",
    borderRadius: 8,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  uploadMeta: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  uploadFileName: {
    color: "#212121",
    fontSize: FONT_SIZE.label,
    fontWeight: "600",
  },
  uploadFileSize: {
    color: "#5B5B5B",
    fontSize: FONT_SIZE.label,
    marginTop: 2,
  },
  uploadRemoveButton: {
    alignItems: "center",
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: "#056D1E",
    borderRadius: 30,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginTop: 2,
    minHeight: 58,
  },
  submitButtonDisabled: {
    opacity: 0.75,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: FONT_SIZE.button,
    fontWeight: "700",
  },

  newsTopSection: {
    marginBottom: 12,
  },
  newsHeading: {
    color: "#121212",
    fontSize: FONT_SIZE.title,
    fontWeight: "700",
    lineHeight: 38,
    width: "100%",
  },
  filterRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    backgroundColor: "#DFDFDF",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterChipActive: {
    backgroundColor: "#06722D",
  },
  filterChipText: {
    color: "#555555",
    fontSize: FONT_SIZE.button,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  featuredCard: {
    borderRadius: 11,
    marginBottom: 18,
    overflow: "hidden",
  },
  featuredImageWrap: {
    height: 145,
    justifyContent: "flex-end",
    width: "100%",
  },
  featuredImage: {
    borderRadius: 11,
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.32)",
  },
  featuredContent: {
    paddingBottom: 10,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  featuredTitle: {
    color: "#FFFFFF",
    fontSize: FONT_SIZE.title,
    fontWeight: "800",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  featuredDescription: {
    color: "#EFEFEF",
    fontSize: FONT_SIZE.body,
    lineHeight: 20,
    marginBottom: 7,
  },
  featuredMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  featuredMetaItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  featuredMetaText: {
    color: "#E9E9E9",
    fontSize: FONT_SIZE.label,
    fontWeight: "500",
  },
  newsCard: {
    backgroundColor: "#F8F8F8",
    borderColor: "#E6E6E6",
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 18,
    overflow: "hidden",
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 7,
  },
  newsImage: {
    height: 164,
    width: "100%",
  },
  newsBody: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  newsMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginBottom: 7,
  },
  newsCategory: {
    color: "#1A7438",
    fontSize: FONT_SIZE.label,
    fontWeight: "700",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  newsDot: {
    color: "#4E4E4E",
    fontSize: FONT_SIZE.label,
  },
  newsWhen: {
    color: "#4E4E4E",
    fontSize: FONT_SIZE.label,
  },
  newsTitle: {
    color: "#181818",
    fontSize: FONT_SIZE.title,
    fontWeight: "700",
    lineHeight: 28,
    marginBottom: 7,
  },
  newsDescription: {
    color: "#666666",
    fontSize: FONT_SIZE.body,
    lineHeight: 20,
    marginBottom: 9,
  },
  moreRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  moreText: {
    color: "#167035",
    fontSize: FONT_SIZE.button,
    fontWeight: "500",
  },

  profileTopCard: {
    backgroundColor: "#F8F8F8",
    borderColor: "#D7DDD7",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    padding: 14,
  },
  profileIdentityRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  avatarWrap: {
    height: 126,
    marginRight: 12,
    position: "relative",
    width: 126,
  },
  profileAvatar: {
    borderColor: "#88E695",
    borderRadius: 60,
    borderWidth: 3,
    height: 120,
    width: 120,
  },
  profileAvatarPlaceholder: {
    alignItems: "center",
    backgroundColor: "#EEF3EE",
    justifyContent: "center",
  },
  editAvatarButton: {
    alignItems: "center",
    backgroundColor: "#066D23",
    borderColor: "#E8EFE9",
    borderRadius: 24,
    borderWidth: 3,
    bottom: -1,
    height: 48,
    justifyContent: "center",
    position: "absolute",
    right: -4,
    width: 48,
  },
  profileIdentityTextWrap: {
    flex: 1,
    justifyContent: "center",
  },
  profileName: {
    color: "#131313",
    fontSize: FONT_SIZE.title,
    fontWeight: "700",
  },
  profileInfoCard: {
    alignItems: "center",
    backgroundColor: "#ECECEC",
    borderRadius: 14,
    flexDirection: "row",
    marginTop: 10,
    minHeight: 90,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  profileInfoTextWrap: {
    marginLeft: 12,
  },
  profileInfoLabel: {
    color: "#363636",
    fontSize: FONT_SIZE.label,
    marginBottom: 3,
  },
  profileInfoValue: {
    color: "#111111",
    fontSize: FONT_SIZE.body,
    fontWeight: "500",
  },
  profileRequestsHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 2,
  },
  profileRequestsTitle: {
    color: "#111111",
    fontSize: FONT_SIZE.title,
    fontWeight: "700",
  },
  profileRequestsEmptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    minHeight: 54,
  },
  profileRequestsEmptyText: {
    color: "#6A6A6A",
    fontSize: FONT_SIZE.body,
    textAlign: "center",
  },
  profileRequestCard: {
    backgroundColor: "#F8F8F8",
    borderColor: "#D8DDD8",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    minHeight: 168,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  profileRequestTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  profileStatusPill: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  profileStatusText: {
    fontSize: FONT_SIZE.label,
    fontWeight: "700",
  },
  profileRequestDate: {
    color: "#2A2A2A",
    fontSize: FONT_SIZE.label,
    fontWeight: "500",
  },
  profileRequestTitle: {
    color: "#101010",
    fontSize: FONT_SIZE.title,
    fontWeight: "700",
    marginBottom: 8,
  },
  profileRequestDescription: {
    color: "#303030",
    fontSize: FONT_SIZE.body,
    lineHeight: 24,
  },
  profileAttachmentsWrap: {
    gap: 8,
    marginTop: 12,
  },
  profileAttachmentItem: {
    alignItems: "center",
    backgroundColor: "#EEF3EE",
    borderColor: "#D5DED5",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  profileAttachmentThumbnail: {
    borderRadius: 6,
    height: 40,
    width: 40,
  },
  profileAttachmentPdfIconWrap: {
    alignItems: "center",
    backgroundColor: "#E5ECE5",
    borderRadius: 6,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  profileAttachmentName: {
    color: "#1F1F1F",
    flex: 1,
    fontSize: FONT_SIZE.label,
    marginLeft: 10,
  },
  profileNoAttachmentsText: {
    color: "#666666",
    fontSize: FONT_SIZE.label,
  },
  profileMenuCard: {
    backgroundColor: "#F8F8F8",
    borderColor: "#D8DDD8",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    overflow: "hidden",
  },
  profileMenuRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 82,
    paddingHorizontal: 18,
  },
  profileMenuRowBorder: {
    borderBottomColor: "#DFE2DF",
    borderBottomWidth: 1,
  },
  profileMenuLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  profileMenuText: {
    color: "#121212",
    fontSize: FONT_SIZE.body,
    fontWeight: "500",
  },
  settingsHeader: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 10,
    marginTop: 2,
  },
  settingsBackButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    marginRight: 8,
    width: 36,
  },
  settingsHeaderTitle: {
    color: "#121212",
    fontSize: FONT_SIZE.title,
    fontWeight: "700",
  },
  settingsSectionTitle: {
    color: "#151515",
    fontSize: FONT_SIZE.title,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 6,
  },
  settingsCard: {
    backgroundColor: "#F8F8F8",
    borderColor: "#D8DDD8",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    overflow: "hidden",
  },
  settingsRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 84,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  settingsRowBorder: {
    borderBottomColor: "#DFE2DF",
    borderBottomWidth: 1,
  },
  settingsIconWrap: {
    alignItems: "center",
    backgroundColor: "#E9ECE9",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    marginRight: 10,
    width: 44,
  },
  settingsTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  settingsRowTitle: {
    color: "#141414",
    fontSize: FONT_SIZE.body,
    fontWeight: "700",
    marginBottom: 3,
  },
  settingsRowSubtitle: {
    color: "#555555",
    fontSize: FONT_SIZE.label,
    lineHeight: 20,
  },
  settingsLogoutButton: {
    alignItems: "center",
    backgroundColor: "#F4DCDC",
    borderColor: "#E9CACA",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 4,
    marginTop: 4,
    minHeight: 64,
  },
  settingsLogoutText: {
    color: "#9B1111",
    fontSize: FONT_SIZE.button,
    fontWeight: "700",
  },
  profileLogoutButton: {
    marginTop: 12,
  },
  fab: {
    alignItems: "center",
    backgroundColor: "#0B7E23",
    borderColor: "#0B671E",
    borderRadius: 28,
    borderWidth: 1,
    bottom: 90,
    height: 56,
    justifyContent: "center",
    position: "absolute",
    right: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    width: 56,
    zIndex: 10,
  },
  bottomTab: {
    alignItems: "center",
    backgroundColor: "#F6F7F6",
    borderTopColor: "#D0D5D0",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 9,
    paddingHorizontal: 9,
    paddingTop: 8,
  },
  tabItem: {
    alignItems: "center",
    flex: 1,
    flexShrink: 1,
    justifyContent: "center",
    minWidth: 0,
    paddingVertical: 4,
  },
  tabContent: {
    alignItems: "center",
    borderRadius: 15,
    minWidth: 78,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tabContentActive: {
    backgroundColor: "#73A7F7",
  },
  tabLabel: {
    color: "#292929",
    flexShrink: 1,
    fontSize: FONT_SIZE.label,
    marginTop: 2,
    textAlign: "center",
  },
  tabLabelActive: {
    color: "#184C97",
    fontWeight: "600",
  },
  modalBackdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.38)",
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
  },
  attachmentPickerSheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8DED8",
    gap: 10,
    padding: 14,
  },
  attachmentPickerTitle: {
    color: "#111111",
    fontSize: FONT_SIZE.title,
    fontWeight: "700",
    marginBottom: 4,
  },
  attachmentPickerOption: {
    alignItems: "center",
    borderColor: "#D5DDD5",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  attachmentPickerOptionText: {
    color: "#1A1A1A",
    fontSize: FONT_SIZE.body,
    fontWeight: "600",
  },
  imagePreviewOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.86)",
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  imagePreviewCloseButton: {
    position: "absolute",
    right: 22,
    top: 46,
    zIndex: 2,
  },
  imagePreviewFull: {
    height: "80%",
    width: "100%",
  },
  successToast: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#0B6E24",
    borderRadius: 999,
    bottom: 90,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: "absolute",
  },
  successToastText: {
    color: "#FFFFFF",
    fontSize: FONT_SIZE.label,
    fontWeight: "700",
  },
  lastListItem: {
    marginBottom: 0,
  },
});

















