import { Feather } from "@expo/vector-icons";
import { Image, ImageBackground, Pressable, Text, View } from "react-native";

type NewsFilter = {
  key: string;
  label: string;
};

type NewsCard = {
  categoryLabel: string;
  description: string;
  image: string;
  title: string;
  when: string;
};

type FeaturedNews = {
  date: string;
  description: string;
  image: string;
  title: string;
  views: string;
};

type NewsTabProps = {
  activeFilter: string;
  featuredNews: FeaturedNews;
  filteredNews: NewsCard[];
  newsFilters: NewsFilter[];
  onSetActiveFilter: (key: string) => void;
  styles: Record<string, any>;
};

export default function NewsTab({
  activeFilter,
  featuredNews,
  filteredNews,
  newsFilters,
  onSetActiveFilter,
  styles,
}: NewsTabProps) {
  return (
    <>
      <View style={styles.newsTopSection}>
        <Text style={styles.newsHeading}>Сүүлийн үеийн мэдээ</Text>
        <View style={styles.filterRow}>
          {newsFilters.map((filter) => {
            const isActive = filter.key === activeFilter;
            return (
              <Pressable
                key={filter.key}
                onPress={() => onSetActiveFilter(filter.key)}
                style={[styles.filterChip, isActive ? styles.filterChipActive : undefined]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive ? styles.filterChipTextActive : undefined,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable style={styles.featuredCard}>
        <ImageBackground
          imageStyle={styles.featuredImage}
          source={{ uri: featuredNews.image }}
          style={styles.featuredImageWrap}
        >
          <View style={styles.featuredOverlay} />
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle}>{featuredNews.title}</Text>
            <Text style={styles.featuredDescription}>{featuredNews.description}</Text>
            <View style={styles.featuredMetaRow}>
              <View style={styles.featuredMetaItem}>
                <Feather color="#E9E9E9" name="calendar" size={12} />
                <Text style={styles.featuredMetaText}>{featuredNews.date}</Text>
              </View>
              <View style={styles.featuredMetaItem}>
                <Feather color="#E9E9E9" name="eye" size={12} />
                <Text style={styles.featuredMetaText}>{featuredNews.views}</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </Pressable>

      {filteredNews.map((item, index) => (
        <Pressable
          key={`${item.title}-${item.when}`}
          style={[styles.newsCard, index === filteredNews.length - 1 ? styles.lastListItem : undefined]}
        >
          <Image source={{ uri: item.image }} style={styles.newsImage} />
          <View style={styles.newsBody}>
            <View style={styles.newsMetaRow}>
              <Text style={styles.newsCategory}>{item.categoryLabel}</Text>
              <Text style={styles.newsDot}>•</Text>
              <Text style={styles.newsWhen}>{item.when}</Text>
            </View>
            <Text numberOfLines={2} style={styles.newsTitle}>
              {item.title}
            </Text>
            <Text numberOfLines={3} style={styles.newsDescription}>
              {item.description}
            </Text>
            <View style={styles.moreRow}>
              <Text style={styles.moreText}>Дэлгэрэнгүй</Text>
              <Feather color="#177237" name="arrow-right" size={15} />
            </View>
          </View>
        </Pressable>
      ))}
    </>
  );
}

