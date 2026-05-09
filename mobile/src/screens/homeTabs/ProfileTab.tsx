import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Image, Pressable, Switch, Text, View } from "react-native";
import { CitizenRequestRecord } from "../../services/requests";

type ProfileMenu = {
  icon: "cog-outline";
  key: "settings";
  label: string;
};

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

type ProfileTabProps = {
  currentUserRole?: string;
  emailNotificationsEnabled: boolean;
  getFileNameFromRemoteUrl: (url: string) => string;
  handleLogout: () => void;
  handleOpenPdfAttachment: (url: string) => Promise<void> | void;
  hasNoProfileRequests: boolean;
  isImageAttachmentUrl: (url: string) => boolean;
  isProfileRequestsLoading: boolean;
  isSettingsScreenOpen: boolean;
  onCloseSettings: () => void;
  onOpenSettings: () => void;
  onPickProfileAvatar: () => void;
  onSetEmailNotificationsEnabled: (enabled: boolean) => void;
  onSetPreviewImageUri: (uri: string) => void;
  onSetPushNotificationsEnabled: (enabled: boolean) => void;
  profileAvatarUri: string | null;
  profileDisplayName: string;
  profileEmail: string;
  profileMenus: ProfileMenu[];
  profilePhone: string;
  profileRequestCards: ProfileRequestCard[];
  pushNotificationsEnabled: boolean;
  styles: Record<string, any>;
};

export default function ProfileTab({
  currentUserRole,
  emailNotificationsEnabled,
  getFileNameFromRemoteUrl,
  handleLogout,
  handleOpenPdfAttachment,
  hasNoProfileRequests,
  isImageAttachmentUrl,
  isProfileRequestsLoading,
  isSettingsScreenOpen,
  onCloseSettings,
  onOpenSettings,
  onPickProfileAvatar,
  onSetEmailNotificationsEnabled,
  onSetPreviewImageUri,
  onSetPushNotificationsEnabled,
  profileAvatarUri,
  profileDisplayName,
  profileEmail,
  profileMenus,
  profilePhone,
  profileRequestCards,
  pushNotificationsEnabled,
  styles,
}: ProfileTabProps) {
  if (isSettingsScreenOpen) {
    return (
      <>
        <View style={styles.settingsHeader}>
          <Pressable hitSlop={8} onPress={onCloseSettings} style={styles.settingsBackButton}>
            <Feather color="#111111" name="arrow-left" size={24} />
          </Pressable>
          <Text style={styles.settingsHeaderTitle}>Тохиргоо</Text>
        </View>

        <Text style={styles.settingsSectionTitle}>Хувийн тохиргоо</Text>
        <View style={styles.settingsCard}>
          <Pressable style={styles.settingsRow}>
            <View style={styles.settingsIconWrap}>
              <MaterialCommunityIcons color="#1F5FAE" name="lock-reset" size={24} />
            </View>
            <View style={styles.settingsTextWrap}>
              <Text style={styles.settingsRowTitle}>Нууц үг солих</Text>
              <Text style={styles.settingsRowSubtitle}>Аюулгүй байдлыг хангах</Text>
            </View>
            <Feather color="#323232" name="chevron-right" size={24} />
          </Pressable>
        </View>

        <Text style={styles.settingsSectionTitle}>Мэдэгдэл</Text>
        <View style={styles.settingsCard}>
          <View style={[styles.settingsRow, styles.settingsRowBorder]}>
            <View style={styles.settingsIconWrap}>
              <MaterialCommunityIcons color="#A85A1A" name="email-outline" size={24} />
            </View>
            <View style={styles.settingsTextWrap}>
              <Text style={styles.settingsRowTitle}>И-мэйл мэдэгдэл</Text>
              <Text style={styles.settingsRowSubtitle}>Статус өөрчлөгдөх үед</Text>
            </View>
            <Switch
              onValueChange={onSetEmailNotificationsEnabled}
              trackColor={{ false: "#D2D7D2", true: "#108028" }}
              value={emailNotificationsEnabled}
            />
          </View>

          <View style={styles.settingsRow}>
            <View style={styles.settingsIconWrap}>
              <MaterialCommunityIcons color="#A85A1A" name="bell-outline" size={24} />
            </View>
            <View style={styles.settingsTextWrap}>
              <Text style={styles.settingsRowTitle}>Push мэдэгдэл</Text>
              <Text style={styles.settingsRowSubtitle}>Яаралтай шинэчлэлтүүд</Text>
            </View>
            <Switch
              onValueChange={onSetPushNotificationsEnabled}
              trackColor={{ false: "#D2D7D2", true: "#108028" }}
              value={pushNotificationsEnabled}
            />
          </View>
        </View>

        <Pressable onPress={handleLogout} style={styles.settingsLogoutButton}>
          <MaterialCommunityIcons color="#9B1111" name="logout-variant" size={24} />
          <Text style={styles.settingsLogoutText}>Системээс гарах</Text>
        </Pressable>
      </>
    );
  }

  return (
    <>
      <View style={styles.profileTopCard}>
        <View style={styles.profileIdentityRow}>
          <View style={styles.avatarWrap}>
            {profileAvatarUri ? (
              <Image source={{ uri: profileAvatarUri }} style={styles.profileAvatar} />
            ) : (
              <View style={[styles.profileAvatar, styles.profileAvatarPlaceholder]}>
                <Feather color="#90A090" name="user" size={52} />
              </View>
            )}
            <Pressable hitSlop={8} onPress={onPickProfileAvatar} style={styles.editAvatarButton}>
              <Feather color="#FFFFFF" name="edit-2" size={16} />
            </Pressable>
          </View>

          <View style={styles.profileIdentityTextWrap}>
            <Text style={styles.profileName}>{profileDisplayName}</Text>
          </View>
        </View>

        <View style={styles.profileInfoCard}>
          <MaterialCommunityIcons color="#0B6D29" name="email-outline" size={30} />
          <View style={styles.profileInfoTextWrap}>
            <Text style={styles.profileInfoLabel}>И-мэйл хаяг</Text>
            <Text style={styles.profileInfoValue}>{profileEmail}</Text>
          </View>
        </View>

        <View style={styles.profileInfoCard}>
          <MaterialCommunityIcons color="#0B6D29" name="phone-outline" size={30} />
          <View style={styles.profileInfoTextWrap}>
            <Text style={styles.profileInfoLabel}>Утасны дугаар</Text>
            <Text style={styles.profileInfoValue}>{profilePhone}</Text>
          </View>
        </View>
      </View>

      <View style={styles.profileRequestsHeader}>
        <Text style={styles.profileRequestsTitle}>
          {currentUserRole === "admin"
            ? "\u0425\u04af\u0441\u044d\u043b\u0442\u04af\u04af\u0434"
            : "\u041c\u0438\u043d\u0438\u0439 \u0445\u04af\u0441\u044d\u043b\u0442\u04af\u04af\u0434"}
        </Text>
      </View>

      {isProfileRequestsLoading ? (
        <View style={styles.profileRequestsEmptyWrap}>
          <ActivityIndicator color="#2E7D32" size="small" />
        </View>
      ) : null}

      {hasNoProfileRequests ? (
        <View style={styles.profileRequestsEmptyWrap}>
          <Text style={styles.profileRequestsEmptyText}>Таны хүсэлт алга</Text>
        </View>
      ) : null}

      {!isProfileRequestsLoading
        ? profileRequestCards.map((item) => (
            <View key={item.id} style={styles.profileRequestCard}>
              <View style={styles.profileRequestTopRow}>
                <View style={[styles.profileStatusPill, { backgroundColor: item.statusBg }]}>
                  <Text style={[styles.profileStatusText, { color: item.statusColor }]}>
                    {item.status}
                  </Text>
                </View>
                <Text style={styles.profileRequestDate}>{item.date}</Text>
              </View>

              <Text style={styles.profileRequestTitle}>{item.title}</Text>
              <Text numberOfLines={2} style={styles.profileRequestDescription}>
                {item.description}
              </Text>

              <View style={styles.profileAttachmentsWrap}>
                {item.attachments.length > 0 ? (
                  item.attachments.map((attachment) => {
                    const fileName = getFileNameFromRemoteUrl(attachment.url);
                    const isImageAttachment = isImageAttachmentUrl(attachment.url);

                    if (isImageAttachment) {
                      return (
                        <Pressable
                          key={`${item.id}-${attachment.publicId}`}
                          onPress={() => onSetPreviewImageUri(attachment.url)}
                          style={styles.profileAttachmentItem}
                        >
                          <Image
                            source={{ uri: attachment.url }}
                            style={styles.profileAttachmentThumbnail}
                          />
                          <Text numberOfLines={1} style={styles.profileAttachmentName}>
                            {fileName}
                          </Text>
                        </Pressable>
                      );
                    }

                    return (
                      <Pressable
                        key={`${item.id}-${attachment.publicId}`}
                        onPress={() => {
                          void handleOpenPdfAttachment(attachment.url);
                        }}
                        style={styles.profileAttachmentItem}
                      >
                        <View style={styles.profileAttachmentPdfIconWrap}>
                          <MaterialCommunityIcons color="#A11E1E" name="file-pdf-box" size={22} />
                        </View>
                        <Text numberOfLines={1} style={styles.profileAttachmentName}>
                          {fileName}
                        </Text>
                      </Pressable>
                    );
                  })
                ) : (
                  <Text style={styles.profileNoAttachmentsText}>
                    {"\u0425\u0430\u0432\u0441\u0440\u0430\u043b\u0442 \u0431\u0430\u0439\u0445\u0433\u04af\u0439"}
                  </Text>
                )}
              </View>
            </View>
          ))
        : null}

      <View style={styles.profileMenuCard}>
        {profileMenus.map((item, index) => (
          <Pressable
            key={item.label}
            onPress={() => {
              if (item.key === "settings") {
                onOpenSettings();
              }
            }}
            style={[
              styles.profileMenuRow,
              index < profileMenus.length - 1 ? styles.profileMenuRowBorder : undefined,
            ]}
          >
            <View style={styles.profileMenuLeft}>
              <MaterialCommunityIcons color="#121212" name={item.icon} size={32} />
              <Text style={styles.profileMenuText}>{item.label}</Text>
            </View>
            <Feather color="#2F392F" name="chevron-right" size={30} />
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={handleLogout}
        style={[styles.settingsLogoutButton, styles.profileLogoutButton]}
      >
        <MaterialCommunityIcons color="#9B1111" name="logout-variant" size={24} />
        <Text style={styles.settingsLogoutText}>Системээс гарах</Text>
      </Pressable>
    </>
  );
}

