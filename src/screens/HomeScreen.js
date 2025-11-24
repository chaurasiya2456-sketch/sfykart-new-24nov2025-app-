import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";

import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import HeroSlider from "../components/HeroSlider";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ⭐ Convert rating number → ★★★★☆ */
const renderStars = (rating) => {
  let stars = "";
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  for (let i = 0; i < full; i++) stars += "★";
  if (half) stars += "☆";
  while (stars.length < 5) stars += "☆";
  return stars;
};

function HomeContent() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  /* --------------------------------------------------------
      🔥 FETCH TRENDING PRODUCTS
  ----------------------------------------------------------- */
  const fetchProducts = async () => {
    try {
      const q = query(collection(db, "products"), where("trending", "==", true));
      const snap = await getDocs(q);

      const list = snap.docs.map((doc) => {
        const data = doc.data();
        const image = data.images?.[0]?.url || "";

        const off = Math.round(
          ((data.comparePrice - data.price) / data.comparePrice) * 100
        );

        return {
          id: doc.id,
          image,
          off,
          reviews: data.reviews || 0,
          rating: Number(data.avgRating || data.rating || 4.3),
          ...data,
        };
      });

      setProducts(list);
    } catch (err) {
      console.log("Trending fetch error:", err);
    }
  };

  /* --------------------------------------------------------
    ⭐ FETCH FEATURED PRODUCTS
  ----------------------------------------------------------- */
  const fetchFeaturedProducts = async () => {
    try {
      const q = query(collection(db, "products"), where("featured", "==", true));
      const snap = await getDocs(q);

      const list = snap.docs.map((doc) => {
        const data = doc.data();
        const image = data.images?.[0]?.url || "";

        const off = Math.round(
          ((data.comparePrice - data.price) / data.comparePrice) * 100
        );

        return {
          id: doc.id,
          image,
          off,
          reviews: data.totalReviews || 0,
          rating: Number(data.avgRating || data.rating || 4.4),
          ...data,
        };
      });

      setFeatured(list);
    } catch (err) {
      console.log("Featured fetch error:", err);
    }
  };

  /* LOAD BOTH */
  useEffect(() => {
    (async () => {
      await fetchProducts();
      await fetchFeaturedProducts();
      setLoading(false);
    })();
  }, []);

  /* --------------------------------------------------------
      🛒 ADD TO CART FUNCTION
  ----------------------------------------------------------- */
  const handleAddToCart = async (item) => {
    try {
      const key = "sfy_cart_v1";
      const raw = await AsyncStorage.getItem(key);
      const cart = raw ? JSON.parse(raw) : [];

      const idx = cart.findIndex((x) => x.slug === item.slug);

      if (idx !== -1) {
        cart[idx].quantity = (cart[idx].quantity || 1) + 1;
      } else {
        cart.push({
          id: item.id,
          slug: item.slug,
          name: item.name,
          price: item.price,
          comparePrice: item.comparePrice,
          image: item.image,
          quantity: 1,
        });
      }

      await AsyncStorage.setItem(key, JSON.stringify(cart));
      Alert.alert("Added to Cart", `${item.name} added to cart`);
    } catch (err) {
      Alert.alert("Error", "Unable to add to cart");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.logo}>SfyKart</Text>
        <TextInput style={styles.search} placeholder="Search for products..." />
      </View>

      <ScrollView>

        {/* HERO SLIDER */}
        <HeroSlider />

        {/* CATEGORIES */}
        <Text style={styles.sectionTitle}>Categories</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 10 }}>
          {[
            "Mobiles", "Electronics", "Fashion", "Home", "Beauty",
            "Grocery", "Sports", "Toys", "Shoes", "Kitchen",
          ].map((cat, i) => (
            <View key={i} style={styles.categoryBox}>
              <Text style={styles.categoryText}>{cat}</Text>
            </View>
          ))}
        </ScrollView>

        {/* --------------------------------------------------------
              🔥 TRENDING PRODUCTS
        ----------------------------------------------------------- */}
        <Text style={styles.sectionTitle}>Trending Products</Text>

        <View style={styles.gridWrapper}>
          {products.map((item, index) => (
            <View key={index} style={styles.productCard}>

              {/* CLICKABLE WHOLE AREA */}
              <TouchableOpacity onPress={() => navigation.navigate("ProductDetails", item)}>
                <View style={styles.imageBox}>
                  <Image source={{ uri: item.image }} style={styles.prodImg} />
                </View>

                <Text style={styles.productName} numberOfLines={1}>
                  {item.name}
                </Text>

                <Text style={styles.ratingStar}>
                  <Text style={styles.starIcon}>{renderStars(item.rating)}</Text>
                  <Text style={styles.reviews}> ({item.reviews})</Text>
                </Text>

                <View style={styles.priceRow}>
                  <Text style={styles.productPrice}>₹{item.price}</Text>
                  <Text style={styles.mrp}>₹{item.comparePrice}</Text>
                  <Text style={styles.discount}>{item.off}% off</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.addBtn} onPress={() => handleAddToCart(item)}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* --------------------------------------------------------
              ⭐ FEATURED PRODUCTS
        ----------------------------------------------------------- */}
        <Text style={styles.sectionTitle}>Featured Products</Text>

        <View style={styles.gridWrapper}>
          {featured.map((item, index) => (
            <View key={index} style={styles.productCard}>

              <TouchableOpacity onPress={() => navigation.navigate("ProductDetails", item)}>
                <View style={styles.imageBox}>
                  <Image source={{ uri: item.image }} style={styles.prodImg} />
                </View>

                <Text style={styles.productName} numberOfLines={1}>
                  {item.name}
                </Text>

                <Text style={styles.ratingStar}>
                  <Text style={styles.starIcon}>{renderStars(item.rating)}</Text>
                  <Text style={styles.reviews}> ({item.reviews})</Text>
                </Text>

                <View style={styles.priceRow}>
                  <Text style={styles.productPrice}>₹{item.price}</Text>
                  <Text style={styles.mrp}>₹{item.comparePrice}</Text>
                  <Text style={styles.discount}>{item.off}% off</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.addBtn} onPress={() => handleAddToCart(item)}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaProvider>
      <HomeContent />
    </SafeAreaProvider>
  );
}

/* --------------------------------------------------------
                    STYLES
----------------------------------------------------------- */
const styles = StyleSheet.create({
  header: {
    backgroundColor: "#007bff",
    paddingHorizontal: 12,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  logo: { color: "#fff", fontSize: 22, fontWeight: "900" },
  search: {
    flex: 1,
    backgroundColor: "#fff",
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", padding: 15 },

  categoryBox: {
    backgroundColor: "#eee",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 12,
  },
  categoryText: { fontSize: 14, fontWeight: "600" },

  gridWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },

  productCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },

  imageBox: {
    height: 160,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  prodImg: { width: "100%", height: "100%" },

  productName: { fontSize: 14, fontWeight: "600" },

  ratingStar: { fontSize: 13, marginTop: 2, color: "#333" },
  starIcon: { color: "#ff9f00", fontSize: 15 },

  reviews: { color: "#777", fontSize: 12 },

  priceRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  productPrice: { fontSize: 15, fontWeight: "900", marginRight: 6 },
  mrp: {
    fontSize: 12,
    textDecorationLine: "line-through",
    color: "#777",
    marginRight: 6,
  },
  discount: { fontSize: 12, color: "green", fontWeight: "700" },

  addBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
});
