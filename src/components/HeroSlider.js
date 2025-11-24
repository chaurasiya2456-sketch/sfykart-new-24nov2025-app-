import { View, Image, Dimensions, StyleSheet } from "react-native";
import { SwiperFlatList } from "react-native-swiper-flatlist";

const { width } = Dimensions.get("window");

const banners = [
  "https://picsum.photos/800/300?random=1",
  "https://picsum.photos/800/300?random=2",
  "https://picsum.photos/800/300?random=3",
];

export default function HeroSlider() {
  return (
    <View style={{ marginTop: 10 }}>
      <SwiperFlatList
        autoplay
        autoplayDelay={3}
        autoplayLoop
        index={0}
        showPagination
        paginationStyleItem={styles.dot}
      >
        {banners.map((img, index) => (
          <View key={index} style={{ width }}>
            <Image source={{ uri: img }} style={styles.banner} />
          </View>
        ))}
      </SwiperFlatList>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  dot: {
    width: 8,
    height: 8,
    marginHorizontal: 3,
  }
});
