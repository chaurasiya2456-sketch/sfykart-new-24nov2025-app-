// ProductDetails.js
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { db } from "../firebaseConfig";

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc
} from "firebase/firestore";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useNavigation } from "@react-navigation/native";


// ---------- Shiprocket Token ----------
const getShiprocketToken = async () => {
  try {
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "YOUR_SHIPROCKET_EMAIL",
        password: "YOUR_SHIPROCKET_PASSWORD",
      }),
    });
    const data = await res.json();
    return data?.token || null;
  } catch (err) {
    return null;
  }
};

// ---------- Helpers ----------
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const fmt = (n) => (typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : `₹${n}`);

const formatBoughtNumber = (n) => {
  if (!n || isNaN(n)) return "0";
  if (n < 1000) return String(n);
  const k = n / 1000;
  return k < 10 ? `${k.toFixed(1)}k` : `${Math.round(k)}k`;
};

export default function ProductDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const product = route.params || {};
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];


  // ---------- States ----------
  const [mainIndex, setMainIndex] = useState(0);
  const [offers, setOffers] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [boughtDisplay, setBoughtDisplay] = useState("500+");
  const [dealTimer, setDealTimer] = useState("03h : 00m : 00s");
  const [pincode, setPincode] = useState("");
  const [deliveryMsg, setDeliveryMsg] = useState("");
  const [qty, setQty] = useState(1);
  const [appliedOffer, setAppliedOffer] = useState(null);
  const sliderRef = useRef(null);
  const [qaList, setQaList] = useState([]);
const [related, setRelated] = useState([]);
const [reviewRating, setReviewRating] = useState(0);
const [reviewName, setReviewName] = useState("");
const [reviewText, setReviewText] = useState("");




  // ---------- IMAGES ----------
  const images = Array.isArray(product.images)
    ? product.images.map((x) => (typeof x === "string" ? x : x.url || ""))
    : product.image
    ? [product.image]
    : ["https://via.placeholder.com/300?text=No+Image"];

  // ---------- Auto Slider ----------
  useEffect(() => {
    const id = setInterval(() => {
      setMainIndex((prev) => {
        const next = (prev + 1) % images.length;
        sliderRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [images.length]);

  // ---------- Timer (3 hours) ----------
  useEffect(() => {
    let sec = 3 * 60 * 60;
    const id = setInterval(() => {
      sec--;
      const h = String(Math.floor(sec / 3600)).padStart(2, "0");
      const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
      const s = String(sec % 60).padStart(2, "0");
      setDealTimer(`${h}h : ${m}m : ${s}s`);
      if (sec <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ---------- Fetch Offers + Bought Count ----------
  useEffect(() => {
    (async () => {
      try {
        if (product.slug) {
          const snap = await getDoc(doc(db, "offers", product.slug));
          if (snap.exists()) setOffers(snap.data().offers || []);
        }
      } catch (err) {
        // ignore
      }
      computeBought();
    })();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug]);
// ---------- Load Related Products ----------
useEffect(() => {
  if (product.category) {
    fetchRelatedProducts();
  }
}, [product.category]);

const fetchRelatedProducts = async () => {
  try {
    // 1️⃣ Fetch same-category products
    const q = query(
      collection(db, "products"),
      where("category", "==", product.category)
    );
    const snap = await getDocs(q);

    let sameCat = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((p) => p.slug !== product.slug);

    // 2️⃣ If less than 6, fetch random products
    if (sameCat.length < 6) {
      const allSnap = await getDocs(collection(db, "products"));
      let all = allSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p) => p.slug !== product.slug);

      // Random shuffle
      all = all.sort(() => Math.random() - 0.5);

      // Fill remaining slots
      while (sameCat.length < 6 && all.length > 0) {
        sameCat.push(all.pop());
      }
    }

    // 3️⃣ Take only first 6
    setRelated(sameCat.slice(0, 6));

  } catch (err) {
    console.log("Related fetch error:", err);
  }
};
const handleSubmitReview = async () => {
  if (!reviewRating || !reviewName.trim() || !reviewText.trim()) {
    Alert.alert("Error", "Please fill all fields.");
    return;
  }

  try {
    await addDoc(collection(db, "reviews"), {
      productId: product.slug,
      rating: reviewRating,
      name: reviewName,
      review: reviewText,
      createdAt: Date.now(),
    });

    Alert.alert("Success", "Review submitted!");

    setReviewRating(0);
    setReviewName("");
    setReviewText("");
  } catch (err) {
    console.log(err);
    Alert.alert("Error", "Unable to submit review.");
  }
};


// ---------- Load QA ----------
useEffect(() => {
  if (product.qa && Array.isArray(product.qa)) {
    setQaList(product.qa);
  }
}, [product]);

  const computeBought = () => {
    const CYCLE = [5, 7, 11, 24];
    const base =
      Number(product.boughtCount) > 0 ? Number(product.boughtCount) : Math.floor(500 + Math.random() * 1500);

    let lastUpdated = null;
    if (product.lastUpdated?.seconds) lastUpdated = new Date(product.lastUpdated.seconds * 1000);
    else if (product.lastUpdated) lastUpdated = new Date(product.lastUpdated);

    const today = new Date();
    let days = 0;
    if (lastUpdated)
      days = Math.floor(
        (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
          Date.UTC(lastUpdated.getFullYear(), lastUpdated.getMonth(), lastUpdated.getDate())) /
          (1000 * 60 * 60 * 24)
      );

    if (days < 0) days = 0;
    let add = 0;
    for (let i = 0; i < days; i++) add += CYCLE[i % CYCLE.length];

    setBoughtDisplay(formatBoughtNumber(base + add));
  };

  // ---------- Apply Coupon ----------
  const applyCoupon = () => {
    if (!couponCode.trim()) return setCouponMsg("Enter coupon code");
    const match = offers.find((o) => o.code && o.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (!match) return setCouponMsg("Invalid coupon");

    // validity check (if validTill present)
    if (match.validTill) {
      const now = new Date();
      const exp = new Date(match.validTill);
      if (now > exp) return setCouponMsg("Coupon expired");
    }

    setAppliedOffer(match);
    setCouponMsg(`Applied ${match.code} — ${match.discountType === "percent" ? match.discountValue + "%" : fmt(match.discountValue)} off`);
  };

  // ---------- Check Pincode (Shiprocket) ----------
  const checkPincode = async () => {
    if (!pincode || pincode.length !== 6) {
      setDeliveryMsg("❌ Enter valid 6-digit pincode");
      return;
    }

    try {
      setDeliveryMsg("Checking...");
      const token = await getShiprocketToken();
      if (!token) return setDeliveryMsg("Shiprocket token error");

      const res = await fetch("https://apiv2.shiprocket.in/v1/external/courier/serviceability/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pickup_postcode: "110092",
          delivery_postcode: pincode,
          weight: 0.5,
        }),
      });

      const data = await res.json();
      if (data?.status === 200 && data?.data?.available_courier_companies?.length > 0) {
        setDeliveryMsg("✔ Delivery Available");
      } else {
        setDeliveryMsg("❌ Not deliverable");
      }
    } catch (err) {
      setDeliveryMsg("Error checking delivery");
    }
  };

 /* ---------- SAFE PRODUCT VALUES + PRICE CALCULATIONS ---------- */

// SAFE product values (fallbacks)
const productName = product.name || "Product Name";
const productImage = images[0] || "https://via.placeholder.com/300";
const productRating = product.rating ? Number(product.rating) : 4.5;
const productReviews = product.totalReviews ? Number(product.totalReviews) : 20;

// Safe price & compare price
const price = product.price ? Number(product.price) : 0;

const comparePrice = product.comparePrice
  ? Number(product.comparePrice)
  : price > 0
  ? Math.round(price * 1.3)
  : 999;

// Percentage OFF
const offPercent =
  comparePrice > 0
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

// Total price calculations
const baseTotal = price * qty;

// Coupon saving
const couponSaving = appliedOffer
  ? appliedOffer.discountType === "percent"
    ? Math.round((baseTotal * Number(appliedOffer.discountValue || 0)) / 100)
    : Math.round(Number(appliedOffer.discountValue || 0))
  : 0;

// Final total
const finalTotal = Math.max(0, Math.round(baseTotal - couponSaving));

// MRP saving
const mrpSaving = Math.round((comparePrice - price) * qty);

// Total saving (MRP + Coupon)
const totalSaved = Math.round(mrpSaving + couponSaving);

  // ---------- Cart / Buy Handlers ----------
  const handleAddToCart = async () => {
    try {
      const key = "sfy_cart_v1";
      const raw = await AsyncStorage.getItem(key);
      const cur = raw ? JSON.parse(raw) : [];
      const idx = cur.findIndex((it) => it.slug === product.slug);
      if (idx !== -1) {
        cur[idx].quantity = Math.min(99, (cur[idx].quantity || 1) + qty);
      } else {
        cur.push({
          id: product.id || product.slug,
          slug: product.slug,
          name: product.name,
          price,
          comparePrice,
          image: images[0],
          quantity: qty,
        });
      }
      await AsyncStorage.setItem(key, JSON.stringify(cur));
      Alert.alert("Added to cart", `${product.name} (${qty}) added`);
    } catch (err) {
      Alert.alert("Error", "Could not add to cart");
    }
  };

  const handleBuyNow = async () => {
    try {
      await AsyncStorage.setItem("sfy_buyNow", JSON.stringify({ ...product, quantity: qty }));
      navigation.navigate("Cart");
    } catch (err) {
      Alert.alert("Error", "Could not proceed");
    }
  };

  // --------------------- UI ---------------------
  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: "#fff" }}>
<ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* TITLE */}
        <View style={styles.topHeader}>
          <Text style={styles.title}>{product.name || "Product"}</Text>

          <View style={styles.topRow}>
            <Text style={styles.ratingSmall}>⭐ {(product.avgRating || product.rating || 4.5).toFixed(1)}</Text>
            <Text style={styles.smallGray}>• {product.totalReviews || 0} ratings</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLarge}>{fmt(price)}</Text>
            <Text style={styles.comparePrice}>{fmt(comparePrice)}</Text>
            <Text style={styles.offTag}>({offPercent}% off)</Text>
          </View>
        </View>

        {/* SLIDER */}
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} ref={sliderRef}>
          {images.map((src, i) => (
            <Image key={`main_${i}`} source={{ uri: src || "https://via.placeholder.com/300?text=No+Image" }} style={{ width: SCREEN_WIDTH, height: 330, resizeMode: "contain" }} />
          ))}
        </ScrollView>

        {/* THUMBS */}
        <FlatList
          horizontal
          data={images}
          keyExtractor={(x, i) => "t" + i}
          showsHorizontalScrollIndicator={false}
          style={{ padding: 10 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => {
                setMainIndex(index);
                sliderRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
              }}
              style={[styles.thumbWrap, index === mainIndex && styles.thumbActive]}
            >
              <Image source={{ uri: item || "https://via.placeholder.com/100" }} style={styles.thumbImg} />
            </TouchableOpacity>
          )}
        />

        {/* DEAL + BOUGHT */}
        <View style={styles.infoBox}>
          <Text style={styles.dealText}>
            ⚡ Deal ends in: <Text style={{ fontWeight: "700" }}>{dealTimer}</Text>
          </Text>
          <Text style={styles.boughtText}>🔥 {boughtDisplay} bought last month • Selling fast!</Text>
        </View>

        {/* SPECIAL OFFERS */}
        {offers.length > 0 && (
          <View style={styles.offerBox}>
            <Text style={styles.offerTitle}>💰 Special Offers</Text>
            {offers.map((o, i) => (
              <View key={i} style={styles.offerRow}>
                <Text style={styles.offerHeading}>
                  {o.title || o.desc} • <Text style={styles.offerCode}>{o.code}</Text>
                </Text>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => {
                    setCouponCode(o.code);
                    setCouponMsg(`Code ${o.code} copied`);
                  }}
                >
                  <Text style={{ color: "#007bff", fontWeight: "700" }}>Copy</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* APPLY COUPON */}
        <View style={styles.couponBox}>
          <Text style={styles.couponTitle}>Apply Coupon</Text>
          <View style={styles.couponRow}>
            <TextInput placeholder="Enter coupon" style={styles.couponInputBox} value={couponCode} onChangeText={setCouponCode} />
            <TouchableOpacity style={styles.applyBtn} onPress={applyCoupon}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Apply</Text>
            </TouchableOpacity>
          </View>
          {couponMsg ? <Text style={{ marginTop: 6, color: couponMsg.includes("Applied") ? "green" : "red" }}>{couponMsg}</Text> : null}
        </View>

        {/* CHECK DELIVERY */}
        <View style={styles.deliveryBox}>
          <Text style={styles.deliveryTitle}>Check Delivery</Text>
          <View style={styles.deliveryRow}>
            <TextInput placeholder="Enter pincode" value={pincode} onChangeText={setPincode} style={styles.deliveryInput} keyboardType="numeric" maxLength={6} />
            <TouchableOpacity style={styles.deliveryBtn} onPress={checkPincode}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Check</Text>
            </TouchableOpacity>
          </View>
          {deliveryMsg ? <Text style={{ marginTop: 8, color: deliveryMsg.includes("✔") ? "green" : "red" }}>{deliveryMsg}</Text> : null}
        </View>

        {/* PRICE SUMMARY + QTY + BUTTONS */}
        <View style={styles.summaryBox}>
          {/* Qty Selector */}
          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>Quantity</Text>
            <View style={styles.qtyControl}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty((q) => Math.max(1, q - 1))}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty((q) => Math.min(99, q + 1))}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Total & Savings */}
          <View style={[styles.priceSummary, { justifyContent: "space-between", alignItems: "center", marginTop: 12 }]}>
            <Text style={styles.summaryText}>Total</Text>
            <Text style={styles.summaryAmount}>{fmt(finalTotal)}</Text>
          </View>

          <Text style={styles.saveText}>You Save {fmt(totalSaved)}</Text>

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.atcBtn} onPress={handleAddToCart}>
              <Text style={styles.atcText}>Add to Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buyBtn} onPress={handleBuyNow}>
              <Text style={styles.buyText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* BADGES SECTION */}
<View style={styles.badgeContainer}>

  <View style={styles.badgeItem}>
    <Text style={styles.badgeIcon}>🚚</Text>
    <Text style={styles.badgeText}>Free Delivery</Text>
  </View>

  <View style={styles.badgeItem}>
    <Text style={styles.badgeIcon}>💰</Text>
    <Text style={styles.badgeText}>Pay on Delivery</Text>
  </View>

  <View style={styles.badgeItem}>
    <Text style={styles.badgeIcon}>🔄</Text>
    <Text style={styles.badgeText}>10 Days Replacement</Text>
  </View>

  <View style={styles.badgeItem}>
    <Text style={styles.badgeIcon}>🏆</Text>
    <Text style={styles.badgeText}>Top Brand</Text>
  </View>

</View>
{/* ⭐ Ratings & Review Graph */}
<View style={styles.ratingBox}>
  <Text style={styles.ratingTitle}>⭐ Ratings & Reviews</Text>

  <View style={styles.ratingRow}>
    {/* LEFT BIG RATING */}
    <View style={styles.ratingLeft}>
      <Text style={styles.ratingScore}>{product.rating || 4.5}</Text>
      <Text style={styles.ratingStars}>★★★★★</Text>
      <Text style={styles.ratingCount}>
        {product.totalReviews || 20} ratings
      </Text>
    </View>

    {/* RIGHT STAR BARS */}
    <View style={styles.ratingBars}>
      {[5, 4, 3, 2, 1].map((star, i) => (
        <View key={i} style={styles.barRow}>
          <Text style={styles.barLabel}>{star}</Text>

          <View style={styles.barBg}>
            <View
              style={[
                styles.barFill,
                { width: `${[70, 18, 8, 3, 1][i]}%` },
              ]}
            />
          </View>

          <Text style={styles.barPercent}>{[70, 18, 8, 3, 1][i]}%</Text>
        </View>
      ))}
    </View>
  </View>
</View>

{/* ✍️ Write a Review */}
<View style={styles.reviewWriteBox}>
  <Text style={styles.reviewWriteTitle}>✍️ Write a Review</Text>

  {/* ⭐ STAR SELECTOR */}
  <View style={styles.starRow}>
    {[1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
        <Text
          style={{
            fontSize: 30,
            marginRight: 6,
            color: reviewRating >= star ? "#ff9f00" : "#bbb",
          }}
        >
          ★
        </Text>
      </TouchableOpacity>
    ))}
  </View>

  {/* USER NAME INPUT */}
  <TextInput
    placeholder="Your name"
    style={styles.reviewInput}
    value={reviewName}
    onChangeText={setReviewName}
  />

  {/* REVIEW INPUT */}
  <TextInput
    placeholder="Write your review..."
    multiline
    style={[styles.reviewInput, { height: 90 }]}
    value={reviewText}
    onChangeText={setReviewText}
  />

  {/* SUBMIT */}
  <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitReview}>
    <Text style={{ color: "#fff", fontWeight: "700" }}>Submit Review</Text>
  </TouchableOpacity>
</View>

{/* 🧑‍💬 Customer Reviews */}
<View style={styles.customerBox}>
  <Text style={styles.customerTitle}>🧑‍💬 Customer Reviews</Text>

  {reviews.length === 0 ? (
    <Text style={{ color: "#777", marginTop: 4 }}>No reviews yet.</Text>
  ) : (
    reviews.map((r, i) => (
      <View key={i} style={styles.reviewItem}>
        <Text style={styles.reviewUser}>⭐ {r.rating} — {r.name}</Text>
        <Text style={styles.reviewText}>{r.review}</Text>
      </View>
    ))
  )}
</View>

{/* PRODUCT DESCRIPTION */}
<View style={styles.descBox}>
  <Text style={styles.descTitle}>Product Description</Text>

  <Text style={styles.descText}>
    {product.description
      ? product.description
      : "No description available for this product."}
  </Text>

  {/* KEY FEATURES (IF AVAILABLE) */}
  {product.features && Array.isArray(product.features) && (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.descSubTitle}>Key Features:</Text>

      {product.features.map((f, i) => (
        <View key={i} style={styles.featureRow}>
          <Text style={styles.featureBullet}>•</Text>
          <Text style={styles.featureText}>{f}</Text>
        </View>
      ))}
    </View>
  )}
</View>
{/* PRODUCT SPECIFICATIONS */}
{product.specification &&
  Array.isArray(product.specification) &&
  product.specification.length > 0 && (
    <View style={styles.specBox}>
      <Text style={styles.specTitle}>Specifications</Text>

      {product.specification.map((item, index) => (
        <View key={index} style={styles.specRow}>
          <Text style={styles.specKey}>{item.key}</Text>
          <Text style={styles.specValue}>{item.value}</Text>
        </View>
      ))}
    </View>
)}

{qaList.length > 0 && (
  <View style={styles.qaBox}>
    <Text style={styles.qaTitle}>Questions & Answers</Text>

    {qaList.map((item, index) => (
      <View key={index} style={styles.qaItem}>
        <Text style={styles.question}>❓ {item.question}</Text>

        {item.answer ? (
          <Text style={styles.answer}>✔ {item.answer}</Text>
        ) : (
          <Text style={styles.noAnswer}>⏳ Answer coming soon...</Text>
        )}
      </View>
    ))}
  </View>
)}
{/* RELATED PRODUCTS */}
{related.length > 0 && (
  <View style={styles.relatedBox}>
    <Text style={styles.relatedTitle}>Related Products</Text>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12 }}
    >
      {related.slice(0, 6).map((item, i) => {
        // Correct image handling
        const img =
          item.image ||
          (Array.isArray(item.images) && item.images.length > 0
            ? item.images[0].url
            : "https://via.placeholder.com/200");

        return (
          <TouchableOpacity
            key={i}
            style={styles.relatedCard}
            onPress={() => navigation.push("ProductDetails", item)}
          >
            <Image source={{ uri: img }} style={styles.relatedImg} />

            {/* NAME */}
            <Text style={styles.relatedName} numberOfLines={1}>
              {item.name}
            </Text>

            {/* RATING */}
            <Text style={styles.relatedRating}>
              ⭐ {item.avgRating || 4.5}
            </Text>

            {/* PRICE */}
            <Text style={styles.relatedPrice}>₹{item.price}</Text>

            {/* COMPARE PRICE + % OFF */}
            {item.comparePrice && (
              <Text style={styles.relatedCompare}>
                ₹{item.comparePrice}{" "}
                <Text style={styles.relatedOff}>
                  ({Math.round(
                    ((item.comparePrice - item.price) / item.comparePrice) * 100
                  )}
                  % off)
                </Text>
              </Text>
            )}

            {/* ATC BUTTON */}
            <TouchableOpacity style={styles.relatedATC}>
              <Text style={styles.relatedATCText}>Add to Cart</Text>
            </TouchableOpacity>

            {/* BUY NOW BUTTON */}
            <TouchableOpacity style={styles.relatedBuy}>
              <Text style={styles.relatedBuyText}>Buy Now</Text>
            </TouchableOpacity>

          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
)}



      </ScrollView>
    </View>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  topHeader: { paddingHorizontal: 12, paddingBottom: 10 },
  title: { fontSize: 20, fontWeight: "900", marginTop: 8 },

  topRow: { flexDirection: "row", marginTop: 6 },
  ratingSmall: { color: "#f5a623", fontWeight: "700" },
  smallGray: { marginLeft: 6, color: "#666" },

  priceRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  priceLarge: { fontSize: 22, fontWeight: "900", color: "#0a0" },
  comparePrice: { marginLeft: 10, textDecorationLine: "line-through", color: "#777" },
  offTag: { marginLeft: 8, color: "green", fontWeight: "700" },

  thumbWrap: {
    width: 70,
    height: 70,
    marginRight: 8,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  thumbActive: { borderColor: "#007bff", borderWidth: 2 },
  thumbImg: { width: "100%", height: "100%" },

  infoBox: {
    backgroundColor: "#fff",
    padding: 12,
    marginHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    marginTop: 10,
  },

  dealText: { color: "#d9534f", fontWeight: "800", fontSize: 15 },
  boughtText: { marginTop: 6, color: "#333", fontSize: 14 },

  offerBox: {
    backgroundColor: "#fff",
    padding: 12,
    marginHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    marginTop: 12,
  },
  offerTitle: { fontSize: 16, fontWeight: "800", marginBottom: 8 },

  offerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },

  offerHeading: { fontSize: 14, fontWeight: "700", flex: 1 },
  offerCode: { color: "#007bff", fontWeight: "700" },

  copyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007bff",
  },

  couponBox: {
    backgroundColor: "#fff",
    padding: 12,
    marginHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    marginTop: 12,
  },
  couponTitle: { fontSize: 16, fontWeight: "800" },
  couponRow: { flexDirection: "row", marginTop: 10 },
  couponInputBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fafafa",
  },
  applyBtn: {
    backgroundColor: "#007bff",
    marginLeft: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
  },

  deliveryBox: {
    backgroundColor: "#fff",
    padding: 12,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  deliveryTitle: { fontSize: 16, fontWeight: "800" },

  deliveryRow: { flexDirection: "row", marginTop: 10 },
  deliveryInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fafafa",
  },
  deliveryBtn: {
    backgroundColor: "#28a745",
    marginLeft: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
  },

  summaryBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    marginHorizontal: 12,
    marginTop: 15,
    padding: 14,
  },

  qtyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qtyLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyBtn: {
    width: 36,
    height: 36,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  qtyBtnText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  qtyValue: {
    fontSize: 16,
    fontWeight: "700",
    marginHorizontal: 12,
  },

  priceSummary: {
    flexDirection: "row",
    marginTop: 12,
  },
  summaryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0a0",
  },

  saveText: {
    marginTop: 6,
    fontSize: 13,
    color: "green",
    fontWeight: "700",
  },

  btnRow: {
    flexDirection: "row",
    marginTop: 14,
    justifyContent: "space-between",
  },

  /* ATC → Blue */
  atcBtn: {
  flex: 1,
  backgroundColor: "#fbbf24",
  paddingVertical: 14,
  borderRadius: 10,
  justifyContent: "center",
  alignItems: "center",
  marginRight: 8,
},
  atcText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },

  /* BUY NOW → Yellow/Orange */
  buyBtn: {
  flex: 1,
  backgroundColor: "#2563eb",
  paddingVertical: 14,
  borderRadius: 10,
  justifyContent: "center",
  alignItems: "center",
  marginLeft: 8,
},
  buyText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  badgeContainer: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 18,
  paddingHorizontal: 12,
},

badgeItem: {
  alignItems: "center",
  flex: 1,
},

badgeIcon: {
  fontSize: 22,
},

badgeText: {
  fontSize: 12,
  color: "#333",
  marginTop: 4,
  fontWeight: "600",
  textAlign: "center",
},
/* RATING GRAPH */
/* ⭐ Rating Section */
ratingBox: {
  backgroundColor: "#fff",
  padding: 14,
  marginHorizontal: 12,
  marginTop: 15,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#eee",
},
ratingTitle: {
  fontSize: 18,
  fontWeight: "800",
  marginBottom: 10,
},
ratingRow: {
  flexDirection: "row",
},
ratingLeft: {
  width: "30%",
  alignItems: "center",
},
ratingScore: {
  fontSize: 32,
  fontWeight: "900",
  color: "#333",
},
ratingStars: {
  color: "#ff9f00",
  fontSize: 18,
  marginTop: 4,
},
ratingCount: {
  fontSize: 12,
  color: "#777",
  marginTop: 4,
},

ratingBars: {
  flex: 1,
  paddingLeft: 10,
},
barRow: {
  flexDirection: "row",
  alignItems: "center",
  marginVertical: 2,
},
barLabel: {
  width: 18,
  fontSize: 13,
  color: "#444",
},
barBg: {
  flex: 1,
  height: 8,
  backgroundColor: "#eee",
  borderRadius: 4,
  marginHorizontal: 6,
},
barFill: {
  height: 8,
  backgroundColor: "#ff9f00",
  borderRadius: 4,
},
barPercent: {
  width: 40,
  textAlign: "right",
  fontSize: 12,
  color: "#444",
},

/* ✍️ Write Review Box */
reviewWriteBox: {
  backgroundColor: "#fff",
  padding: 14,
  marginHorizontal: 12,
  marginTop: 15,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#eee",
},
reviewWriteTitle: {
  fontSize: 18,
  fontWeight: "800",
},
starRow: {
  flexDirection: "row",
  marginTop: 10,
},
reviewInput: {
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  backgroundColor: "#fafafa",
  marginTop: 12,
  fontSize: 14,
},
submitBtn: {
  backgroundColor: "#ff9f00",
  paddingVertical: 14,
  borderRadius: 10,
  alignItems: "center",
  marginTop: 12,
},

/* 🧑‍💬 Customer Reviews */
customerBox: {
  backgroundColor: "#fff",
  padding: 14,
  marginHorizontal: 12,
  marginTop: 15,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#eee",
},
customerTitle: {
  fontSize: 18,
  fontWeight: "800",
},
reviewItem: {
  marginTop: 10,
  borderBottomWidth: 1,
  borderBottomColor: "#eee",
  paddingBottom: 10,
},
reviewUser: {
  fontWeight: "700",
  color: "#333",
},
reviewText: {
  marginTop: 4,
  color: "#555",
},
descBox: {
  backgroundColor: "#fff",
  padding: 14,
  marginHorizontal: 12,
  marginTop: 15,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#eee",
},

descTitle: {
  fontSize: 18,
  fontWeight: "800",
  color: "#333",
  marginBottom: 6,
},

descSubTitle: {
  fontSize: 16,
  fontWeight: "700",
  color: "#444",
  marginBottom: 4,
},

descText: {
  fontSize: 14,
  color: "#555",
  lineHeight: 20,
},

featureRow: {
  flexDirection: "row",
  alignItems: "flex-start",
  marginVertical: 2,
},

featureBullet: {
  fontSize: 16,
  marginRight: 6,
  color: "#ff9800",
},

featureText: {
  flex: 1,
  fontSize: 14,
  color: "#444",
  lineHeight: 20,
},
specBox: {
  backgroundColor: "#fff",
  marginTop: 15,
  marginHorizontal: 12,
  padding: 12,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#eee",
},

specTitle: {
  fontSize: 17,
  fontWeight: "800",
  marginBottom: 10,
  color: "#333",
},

specRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingVertical: 8,
  borderBottomWidth: 1,
  borderBottomColor: "#f0f0f0",
},

specKey: {
  fontSize: 14,
  fontWeight: "700",
  color: "#444",
  flex: 1,
},

specValue: {
  fontSize: 14,
  color: "#333",
  flex: 1,
  textAlign: "right",
},
qaBox: {
  backgroundColor: "#fff",
  padding: 12,
  marginHorizontal: 12,
  marginTop: 12,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#eee"
},

qaTitle: {
  fontSize: 16,
  fontWeight: "800",
  marginBottom: 8,
  color: "#333"
},

qaItem: {
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderBottomColor: "#f2f2f2"
},

question: {
  fontSize: 15,
  fontWeight: "700",
  color: "#222"
},

answer: {
  marginTop: 5,
  fontSize: 14,
  color: "green",
  fontWeight: "600"
},

noAnswer: {
  marginTop: 5,
  fontSize: 14,
  color: "#888"
},

relatedBox: {
  marginTop: 18,
  backgroundColor: "#fff",
  paddingVertical: 10,
},

relatedTitle: {
  fontSize: 18,
  fontWeight: "800",
  marginLeft: 15,
  marginBottom: 10,
  color: "#333",
},

relatedCard: {
  width: 160,
  marginRight: 12,
  borderWidth: 1,
  borderColor: "#eee",
  borderRadius: 10,
  padding: 10,
  backgroundColor: "#fff",
},

relatedImg: {
  width: "100%",
  height: 130,
  borderRadius: 8,
  resizeMode: "cover",
},

relatedName: {
  fontSize: 14,
  marginTop: 6,
  fontWeight: "600",
  color: "#333",
},

relatedRating: {
  fontSize: 12,
  marginTop: 3,
  color: "#555",
},

relatedPrice: {
  fontSize: 16,
  fontWeight: "900",
  marginTop: 4,
  color: "#007bff",
},

relatedCompare: {
  fontSize: 12,
  color: "#888",
  textDecorationLine: "line-through",
},

relatedOff: {
  color: "green",
  fontWeight: "600",
},

relatedATC: {
  backgroundColor: "#FFC107",
  paddingVertical: 6,
  borderRadius: 6,
  marginTop: 8,
  alignItems: "center",
},

relatedATCText: {
  fontSize: 13,
  fontWeight: "700",
  color: "#333",
},

relatedBuy: {
  backgroundColor: "#007BFF",
  paddingVertical: 7,
  borderRadius: 6,
  marginTop: 6,
  alignItems: "center",
},

relatedBuyText: {
  fontSize: 13,
  fontWeight: "800",
  color: "#fff",
},


});
