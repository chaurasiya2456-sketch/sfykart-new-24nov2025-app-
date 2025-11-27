// screens/CheckoutScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// ⭐ Local Storage
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⭐ Firebase Config
import { auth, db } from "../firebaseConfig";

// ⭐ Firestore (FINAL correct import)
import { doc, getDoc, collection, addDoc, Timestamp, setDoc } from "firebase/firestore";

const STORAGE_KEY = "sfy_cart_v1";
const LOCAL_PLACEHOLDER = "https://via.placeholder.com/300";

export default function CheckoutScreen() {
  const navigation = useNavigation();

  // -----------------------------
  // STATES
  // -----------------------------
  const [uid, setUid] = useState(null);
  const [billing, setBilling] = useState(null);
  const [sameAsBilling, setSameAsBilling] = useState(true);

  const [deliveryForm, setDeliveryForm] = useState({
    name: "",
    phone: "",
    street: "",
    post: "",
    district: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [items, setItems] = useState([]); // normalized items array used for placing order
  const [loadingItems, setLoadingItems] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placing, setPlacing] = useState(false);

  // ⭐ Buy Now Product (raw object from AsyncStorage)
  const [buyProduct, setBuyProduct] = useState(null);

  // Helper: normalize any item (cart entry or buyNow product) to common shape
  const normalizeItem = (it) => {
    // it may have many shapes: {name, title, price, images, image, slug, quantity, qty}
    let img = LOCAL_PLACEHOLDER;
    if (typeof it.image === "string") img = it.image;
    else if (it.image?.current) img = it.image.current;
    else if (it.images?.[0]?.url) img = it.images[0].url;
    else if (it.images && typeof it.images === "string") img = it.images;

    const qty = Number(it.quantity || it.qty || it.quantity === 0 ? Number(it.quantity || it.qty) : 1) || 1;

    return {
      id: it.id || it.slug || Math.random().toString(36).slice(2),
      title: it.title || it.name || "Product",
      image: img,
      price: Number(it.price || 0),
      qty,
      raw: it,
    };
  };

  // -----------------------------
  // Load buyNow or cart from AsyncStorage (initial)
  // -----------------------------
  useEffect(() => {
    (async () => {
      try {
        setLoadingItems(true);

        // check buyNow first
        const buy = await AsyncStorage.getItem("sfy_buyNow");
        if (buy) {
          const parsed = JSON.parse(buy);

          // set buyProduct so UI knows Buy Now mode is active
          setBuyProduct(parsed);

          // normalize and set items array for placing order (single item)
          setItems([normalizeItem(parsed)]);
          setLoadingItems(false);
          return;
        }

        // otherwise load cart
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const arr = raw ? JSON.parse(raw) : [];

        const normalized = arr.map((it) => normalizeItem(it));
        setItems(normalized);
      } catch (err) {
        console.warn("Checkout load error:", err);
        setItems([]);
      } finally {
        setLoadingItems(false);
      }
    })();
  }, []);

  // -----------------------------
  // PRICE CALCULATION (Buy Now + Cart both supported)
  // -----------------------------
  const subtotal = items.reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 1), 0);
  const deliveryCharge = subtotal > 499 ? 0 : 39;
  const payable = subtotal + deliveryCharge;

  // -----------------------------
  // 1️⃣ LOAD UID
  // -----------------------------
  useEffect(() => {
    const id = auth.currentUser?.uid;
    if (id) setUid(id);
  }, []);

  // -----------------------------
  // 2️⃣ LOAD BILLING + CART AFTER UID (optional)
  // -----------------------------
  useEffect(() => {
    if (!uid) return;

    fetchBilling();
    // no need to call loadCartFromStorage here, initial effect already loaded storage
  }, [uid]);

  // -----------------------------
  // Load Billing Address
  // -----------------------------
  const fetchBilling = async () => {
    try {
      // Try local first
      const local = await AsyncStorage.getItem("sfy_user_v1");

      if (local) {
        const u = JSON.parse(local);
        if (u.billingAddress) {
          setBilling(u.billingAddress);
          return;
        }
      }

      // Load from Firestore
      const snap = await getDoc(doc(db, "users", uid));

      if (snap.exists()) {
        const data = snap.data();

        const b = data.billingAddress || {};
        const d = data.deliveryAddress || {};

        const formatted = {
          name:
            b.name ||
            d.name ||
            `${data.firstName || ""} ${data.lastName || ""}`.trim(),

          phone: b.phone || d.phone || data.mobile || "",
          street: b.street || d.street || "",
          post: b.post || d.post || "",
          district: b.district || d.district || "",
          city: b.city || d.city || "",
          state: b.state || d.state || "",
          pincode: b.pincode || d.pincode || "",
        };

        setBilling(formatted);

        await AsyncStorage.setItem("sfy_user_v1", JSON.stringify(data));
      }
    } catch (err) {
      console.warn("Billing load error:", err);
    }
  };

  // -----------------------------
  // Clear cart
  // -----------------------------
  const clearCart = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.removeItem("sfy_buyNow"); // also clear buyNow after order
    setItems([]);
    setBuyProduct(null);
  };

  // -----------------------------
  // Delivery Selection
  // -----------------------------
  const getSelectedDelivery = () => {
    if (sameAsBilling && billing) return billing;
    return deliveryForm;
  };

  const validateDelivery = () => {
    const d = getSelectedDelivery();
    if (!d.name || !d.phone || !d.street || !d.pincode) {
      Alert.alert("Error", "Please complete address");
      return false;
    }
    return true;
  };

  // ⭐ COD CONFIRMATION POPUP
  const confirmCOD = () => {
    Alert.alert(
      "Confirm Order",
      "Are you sure you want to place this Cash on Delivery order?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => placeOrderCOD(),
        },
      ]
    );
  };

  // -----------------------------
  // COD ORDER PLACE
  // -----------------------------
  const placeOrderCOD = async () => {
    if (!validateDelivery()) return;

    setPlacing(true);

    try {
      const orderDocId = "ORD" + Date.now();

      await setDoc(doc(db, "orders", orderDocId), {
        orderId: orderDocId,
        userId: uid || null,
        items: items,
        billingAddress: billing,
        deliveryAddress: getSelectedDelivery(),
        paymentStatus: "COD",
        totalAmount: payable,
        status: "Confirmed",
        createdAt: Timestamp.fromDate(new Date()),
        expectedDelivery: null,
      });

      await clearCart();

      navigation.replace("ThankYou", {
        orderId: orderDocId,
        amount: payable,
      });
    } catch (err) {
      Alert.alert("Error", err.message || "Could not place order");
    }

    setPlacing(false);
  };

  // -----------------------------
  // ONLINE PAYMENT
  // -----------------------------
  const createOrder = async () => {
    try {
      let res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("rzp_test_RjZEkRsSiAJGUs:igcUUkeWT9p78azeQjVOQHW1"),
        },
        body: JSON.stringify({
          amount: payable * 100, // convert to paisa
          currency: "INR",
          receipt: "sfykart_rcpt_" + Date.now(),
        }),
      });

      const json = await res.json();
      return json.id; // 🔥 Razorpay order_id
    } catch (err) {
      console.log("Order API Error", err);
      return null;
    }
  };

  const startOnlinePayment = async () => {
    if (!validateDelivery()) return;

    const orderId = await createOrder();
    if (!orderId) {
      Alert.alert("Error", "Cannot create order!");
      return;
    }

    // Redirect to Razorpay WebView screen
    navigation.navigate("WebPayment", {
      amount: payable,
      orderId: orderId,
      keyId: "rzp_test_RjZEkRsSiAJGUs",
      delivery: getSelectedDelivery(),
      billing: billing,
      items: items,
      uid: uid,
    });
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 180 }}>
        <Text style={styles.header}>Checkout</Text>

        {/* BILLING ADDRESS */}
        <View style={styles.card}>
          <View style={styles.rowHead}>
            <Ionicons name="home-outline" size={20} color="#1f6feb" />
            <Text style={styles.cardTitle}>Billing Address</Text>
          </View>

          {billing ? (
            <>
              <Text style={styles.addrName}>{billing.name}</Text>
              <Text style={styles.addrText}>
                {billing.street}, {billing.post}
              </Text>
              <Text style={styles.addrText}>
                {billing.district}, {billing.city}
              </Text>
              <Text style={styles.addrText}>
                {billing.state} - {billing.pincode}
              </Text>
              <Text style={styles.addrText}>Phone: {billing.phone}</Text>
            </>
          ) : (
            <Text style={{ color: "#777" }}>Loading address…</Text>
          )}
        </View>

        {/* SAME AS BILLING */}
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Deliver to same address</Text>
            <Switch
              value={sameAsBilling}
              onValueChange={setSameAsBilling}
              thumbColor={sameAsBilling ? "#1f6feb" : "#fff"}
            />
          </View>

          {!sameAsBilling && (
            <View style={{ marginTop: 10 }}>
              {Object.keys(deliveryForm).map((key) => (
                <TextInput
                  key={key}
                  placeholder={key.toUpperCase()}
                  style={styles.input}
                  value={deliveryForm[key]}
                  keyboardType={key === "pincode" ? "numeric" : "default"}
                  onChangeText={(t) =>
                    setDeliveryForm((prev) => ({ ...prev, [key]: t }))
                  }
                />
              ))}
            </View>
          )}
        </View>

        {/* ITEMS */}
        <View style={styles.card}>
          <View style={styles.rowHead}>
            <Ionicons name="cube-outline" size={20} color="#1f6feb" />
            <Text style={styles.cardTitle}>Order Summary</Text>
          </View>

          {loadingItems ? (
            <ActivityIndicator style={{ padding: 20 }} />
          ) : items.length === 0 ? (
            <Text>Your cart is empty.</Text>
          ) : (
            // render normalized items array (works for both buyNow single item and cart)
            items.map((it, index) => (
              <View key={it.id + "_" + index} style={styles.itemRow}>
                <Image source={{ uri: it.image }} style={styles.prodImg} />

                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.itemTitle}>{it.title}</Text>
                  <Text style={styles.itemPrice}>₹{it.price}</Text>
                  <Text style={styles.itemQty}>Qty: {it.qty}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* PAYMENT */}
        <View style={styles.card}>
          <View style={styles.rowHead}>
            <Ionicons name="card-outline" size={20} color="#1f6feb" />
            <Text style={styles.cardTitle}>Payment</Text>
          </View>

          <TouchableOpacity
            style={[styles.payBox, paymentMethod === "cod" && styles.payActive]}
            onPress={() => setPaymentMethod("cod")}
          >
            <Ionicons name="cash-outline" size={20} color="#1f6feb" />
            <Text style={styles.payText}>Cash on Delivery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.payBox, paymentMethod === "online" && styles.payActive]}
            onPress={() => setPaymentMethod("online")}
          >
            <Ionicons name="phone-portrait-outline" size={20} color="#1f6feb" />
            <Text style={styles.payText}>Online Payment</Text>
          </TouchableOpacity>
        </View>

        {/* PRICE DETAILS */}
        <View style={styles.card}>
          <View style={styles.rowHead}>
            <Ionicons name="receipt-outline" size={20} color="#1f6feb" />
            <Text style={styles.cardTitle}>Price Details</Text>
          </View>

          <View style={styles.priceRow}>
            <Text>Subtotal</Text>
            <Text>₹{subtotal}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text>Delivery</Text>
            <Text>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.totalLeft}>Total Payable</Text>
            <Text style={styles.totalRight}>₹{payable}</Text>
          </View>
          <Text
            style={{
              textAlign: "right",
              marginTop: 4,
              color: "#4caf50",
              fontWeight: "600",
              fontSize: 13,
            }}
          >
            ✔ Included all taxes
          </Text>
        </View>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Payable</Text>
          <Text style={styles.bottomPrice}>₹{payable}</Text>
        </View>

        <TouchableOpacity
          disabled={placing}
          style={styles.placeBtn}
          onPress={() => (paymentMethod === "cod" ? confirmCOD() : startOnlinePayment())}
        >
          <Text style={styles.placeTxt}>
            {placing ? "Processing…" : paymentMethod === "cod" ? "Place Order" : `Pay ₹${payable}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// -----------------------------
// STYLES
// -----------------------------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f6f9ff" },

  header: {
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    marginVertical: 14,
    color: "#1f6feb",
  },

  card: {
    backgroundColor: "#fff",
    margin: 12,
    padding: 14,
    borderRadius: 14,
    elevation: 2,
  },

  rowHead: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  cardTitle: { marginLeft: 8, fontSize: 18, fontWeight: "800" },

  addrName: { fontSize: 16, fontWeight: "800" },
  addrText: { marginTop: 4, color: "#444" },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: "#fff",
  },

  itemRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  prodImg: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },

  itemTitle: { fontSize: 15, fontWeight: "700" },
  itemPrice: { fontSize: 15, color: "#1677ff", marginTop: 4 },
  itemQty: { color: "#777", marginTop: 3 },

  payBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginTop: 8,
  },

  payActive: {
    borderColor: "#1f6feb",
    backgroundColor: "#eef6ff",
  },

  payText: { marginLeft: 12, fontSize: 15, fontWeight: "700" },

  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 10,
  },

  totalLeft: { fontSize: 17, fontWeight: "800" },
  totalRight: { fontSize: 18, fontWeight: "900", color: "#1f6feb" },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
  },

  bottomLabel: { fontSize: 13, color: "#666" },
  bottomPrice: { fontSize: 20, fontWeight: "900", color: "#1f6feb" },

  placeBtn: {
    backgroundColor: "#1f6feb",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },

  placeTxt: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
});
