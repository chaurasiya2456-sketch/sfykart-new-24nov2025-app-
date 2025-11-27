import React, { useEffect, useState } from "react";
import { View, Image, Dimensions, StyleSheet, ActivityIndicator } from "react-native";
import { SwiperFlatList } from "react-native-swiper-flatlist";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

const { width } = Dimensions.get("window");

export default function HeroSlider() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---- Firebase Fetch ----
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "HeroSlider"), (snapshot) => {
      const arr = snapshot.docs.map((doc) => doc.data().imageUrl);
      setBanners(arr);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <View style={{ height: 200, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

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
