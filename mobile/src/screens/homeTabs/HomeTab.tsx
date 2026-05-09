import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";

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

type TrendBar = {
  active: boolean;
  day: string;
  height: number;
};

type RecentDecision = {
  date: string;
  description: string;
  image: string;
  status: string;
  statusBg: string;
  title: string;
};

type HomeTabProps = {
  isNoStatsData: boolean;
  isStatsLoading: boolean;
  onPressNewRequest: () => void;
  recentDecisions: readonly RecentDecision[];
  reportCards: HomeStat[];
  statusBreakdown: StatusBreakdown[];
  statusColorMap: Record<string, string>;
  styles: Record<string, any>;
  trendBars: readonly TrendBar[];
};

export default function HomeTab({
  isNoStatsData,
  isStatsLoading,
  onPressNewRequest,
  recentDecisions,
  reportCards,
  statusBreakdown,
  statusColorMap,
  styles,
  trendBars,
}: HomeTabProps) {
  return (
    <>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Сайн байна уу,</Text>
        <Text style={styles.heroDescription}>
          Таны илгээсэн хүсэлт бүр хотын хөгжилд үнэтэй хувь нэмэр оруулна. Бид
          ил тод байдлыг эрхэмлэн ажиллаж байна.
        </Text>

        <Pressable style={styles.heroButton} onPress={onPressNewRequest}>
          <Text style={styles.heroButtonText}>Шинэ хүсэлт илгээх</Text>
        </Pressable>

        <MaterialCommunityIcons
          color="rgba(134, 209, 144, 0.32)"
          name="bank-outline"
          size={120}
          style={styles.heroWatermark}
        />
      </View>

      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>Ил тод байдлын тайлан</Text>
        <Text style={styles.reportPeriod}>
          {"\u0028\u0421\u04af\u04af\u043b\u0438\u0439\u043d 30 \u0445\u043e\u043d\u043e\u0433\u0029"}
        </Text>
      </View>

      <View style={styles.reportGrid}>
        {reportCards.map((card) => (
          <View key={card.label} style={styles.reportCard}>
            <MaterialCommunityIcons color={card.iconColor} name={card.icon} size={20} />
            <Text style={styles.reportValue}>{card.value}</Text>
            <Text style={styles.reportLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.trendCard}>
        <Text style={styles.cardTitle}>Хүсэлтийн хандлага</Text>

        <View style={styles.barsRow}>
          {trendBars.map((bar) => (
            <View key={bar.day} style={styles.barItem}>
              <View
                style={[
                  styles.bar,
                  {
                    backgroundColor: bar.active ? "#0C7A1F" : "#6196E9",
                    height: bar.height,
                  },
                ]}
              />
              <Text style={styles.barLabel}>{bar.day}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.categoryCard}>
        <Text style={styles.cardTitle}>{"\u0422\u04e9\u043b\u04e9\u0432\u04e9\u04e9\u0440"}</Text>

        {statusBreakdown.map((item) => {
          const color = statusColorMap[item.status] ?? "#8A8A8A";
          const normalizedPercent = Math.max(0, Math.min(item.percent, 100));

          return (
            <View key={item.status} style={styles.progressRow}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>{item.status}</Text>
                <Text style={styles.progressPercent}>
                  {item.percent}% ({item.count})
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: color, width: `${normalizedPercent}%` },
                  ]}
                />
              </View>
            </View>
          );
        })}

        {isStatsLoading ? <ActivityIndicator color="#2E7D32" size="small" /> : null}
        {isNoStatsData ? (
          <Text style={styles.emptyStateText}>
            {"\u041e\u0434\u043e\u043e\u0433\u043e\u043e\u0440 \u043c\u044d\u0434\u044d\u044d\u043b\u044d\u043b \u0431\u0430\u0439\u0445\u0433\u04af\u0439."}
          </Text>
        ) : null}
      </View>

      <View style={styles.recentHeader}>
        <Text style={styles.recentTitle}>Сүүлийн үеийн шийдвэрлэлтүүд</Text>
        <Pressable>
          <Text style={styles.recentAction}>Бүгдийг харах</Text>
        </Pressable>
      </View>

      {recentDecisions.map((item, index) => (
        <View
          key={item.title}
          style={[
            styles.recentCard,
            index === recentDecisions.length - 1 ? styles.lastListItem : undefined,
          ]}
        >
          <Image source={{ uri: item.image }} style={styles.recentImage} />

          <View style={styles.recentContent}>
            <View style={styles.recentTopRow}>
              <Text numberOfLines={3} style={styles.recentCardTitle}>
                {item.title}
              </Text>
              <View style={[styles.recentStatusPill, { backgroundColor: item.statusBg }]}>
                <Text style={styles.recentStatusText}>{item.status}</Text>
              </View>
            </View>

            <Text numberOfLines={2} style={styles.recentDescription}>
              {item.description}
            </Text>

            <View style={styles.recentDateRow}>
              <MaterialCommunityIcons color="#8C8F92" name="calendar-blank-outline" size={14} />
              <Text style={styles.recentDateText}>{item.date}</Text>
            </View>
          </View>
        </View>
      ))}
    </>
  );
}

