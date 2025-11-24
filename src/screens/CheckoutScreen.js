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

// ⭐ Firebase (Correct)
import { auth, db } from "../firebaseConfig";

// ⭐ Firestore methods
import { doc, getDoc, collection, addDoc, Timestamp } from "firebase/firestore";


const STORAGE_KEY = "sfy_cart_v1";
const LOCAL_PLACEHOLDER = "https://via.placeholder.com/300";

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const [uid, setUid] = useState(null);

useEffect(() => {
  setUid(auth.currentUser?.uid || null);
}, []);

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

  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placing, setPlacing] = useState(false);

  const subtotal = items.reduce(
    (s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 1),
    0
  );
  const deliveryCharge = subtotal > 499 ? 0 : 39;
  const payable = subtotal + deliveryCharge;

  // -------------------------------------------
  // Load Billing Address From Firestore
  // -------------------------------------------
 const fetchBilling = async () => {
  try {
    // 1️⃣ Try from local storage first (FAST)
    const local = await AsyncStorage.getItem("sfy_user_v1");

    if (local) {
      const u = JSON.parse(local);

      if (u.billingAddress) {
        setBilling(u.billingAddress);
        return;
      }
    }

    // 2️⃣ If not found → load from Firestore
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const snap = await getDoc(doc(db, "users", userId));

    if (snap.exists()) {
      const data = snap.data();

      const b = data.billingAddress || {};
      const d = data.deliveryAddress || {};

      const formatted = {
        name: b.name || d.name || `${data.firstName || ""} ${data.lastName || ""}`.trim(),
        phone: b.phone || d.phone || data.mobile || "",
        street: b.street || d.street || "",
        post: b.post || d.post || "",
        district: b.district || d.district || "",
        city: b.city || d.city || "",
        state: b.state || d.state || "",
        pincode: b.pincode || d.pincode || "",
      };

      setBilling(formatted);

      // ⭐ Save to local for next time
      await AsyncStorage.setItem("sfy_user_v1", JSON.stringify(data));
    }
  } catch (err) {
    console.warn("Billing load error:", err);
  }
};


  // -------------------------------------------
  // Load CART From AsyncStorage
  // -------------------------------------------
  const loadCartFromStorage = async () => {
    setLoadingItems(true);

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];

      const normalized = arr.map((it) => {
        let img = LOCAL_PLACEHOLDER;

        if (typeof it.image === "string") img = it.image;
        else if (it.image?.current && typeof it.image.current === "string")
          img = it.image.current;
        else if (it.images?.[0]?.url) img = it.images[0].url;

        return {
          id:
            it.id ||
            it.productId ||
            it.slug ||
            Math.random().toString(36).slice(2),
          title: it.title || it.name || "Product",
          image: img,
          price: Number(it.price || 0),
          qty: Number(it.qty || it.quantity || 1),
        };
      });

      setItems(normalized);
    } catch (err) {
      console.warn("Cart load error:", err);
    }

    setLoadingItems(false);
  };

  // -------------------------------------------
  // Clear Cart
  // -------------------------------------------
  const clearCart = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setItems([]);
    } catch (err) {}
  };

  // -------------------------------------------
  // Select Correct Delivery Address
  // -------------------------------------------
  const getSelectedDelivery = () => {
    if (sameAsBilling && billing) return billing;
    return deliveryForm;
  };

  const validateDelivery = () => {
    const d = getSelectedDelivery();

    if (!d.name || !d.phone || !d.street || !d.pincode) {
      Alert.alert("Error", "Please complete the address.");
      return false;
    }
    return true;
  };

  // -------------------------------------------
  // Place COD Order
  // -------------------------------------------
  const placeOrderCOD = async () => {
    if (!validateDelivery()) return;
    setPlacing(true);

    try {
      await addDoc(collection(db, "orders"), {
        uid,
        items,
        deliveryAddress: getSelectedDelivery(),
        paymentMethod: "COD",
        amount: payable,
        status: "Pending",
        createdAt: Timestamp.now(),
      });

      await clearCart();
      Alert.alert("Success", "Order placed!");
      navigation.navigate("Orders");
    } catch (err) {
      Alert.alert("Error", err.message);
    }

    setPlacing(false);
  };

  // -------------------------------------------
  // Online Payment
  // -------------------------------------------
  const startOnlinePayment = () => {
    navigation.navigate("WebPayment", {
      url: "https://rzp.io/l/YOUR_SHORT_LINK",
    });
  };

  useEffect(() => {
    fetchBilling();
    loadCartFromStorage();
  }, []);

  // -------------------------------------------
  // UI STARTS
  // -------------------------------------------
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 180 }}>
        <Text style={styles.header}>Checkout</Text>

        {/* ---------------- BILLING ---------------- */}
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
            <Text style={{ color: "#777" }}>No address found.</Text>
          )}
        </View>

        {/* ---------------- SAME AS BILLING ---------------- */}
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
              <TextInput
                placeholder="Full Name"
                style={styles.input}
                value={deliveryForm.name}
                onChangeText={(t) =>
                  setDeliveryForm((p) => ({ ...p, name: t }))
                }
              />
              <TextInput
                placeholder="Phone"
                keyboardType="phone-pad"
                style={styles.input}
                value={deliveryForm.phone}
                onChangeText={(t) =>
                  setDeliveryForm((p) => ({ ...p, phone: t }))
                }
              />
              <TextInput
                placeholder="Street / House"
                style={styles.input}
                value={deliveryForm.street}
                onChangeText={(t) =>
                  setDeliveryForm((p) => ({ ...p, street: t }))
                }
              />
              <TextInput
                placeholder="Post / Landmark"
                style={styles.input}
                value={deliveryForm.post}
                onChangeText={(t) =>
                  setDeliveryForm((p) => ({ ...p, post: t }))
                }
              />
              <TextInput
                placeholder="District"
                style={styles.input}
                value={deliveryForm.district}
                onChangeText={(t) =>
                  setDeliveryForm((p) => ({ ...p, district: t }))
                }
              />
              <TextInput
                placeholder="City"
                style={styles.input}
                value={deliveryForm.city}
                onChangeText={(t) =>
                  setDeliveryForm((p) => ({ ...p, city: t }))
                }
              />
              <TextInput
                placeholder="State"
                style={styles.input}
                value={deliveryForm.state}
                onChangeText={(t) =>
                  setDeliveryForm((p) => ({ ...p, state: t }))
                }
              />
              <TextInput
                placeholder="Pincode"
                keyboardType="numeric"
                style={styles.input}
                value={deliveryForm.pincode}
                onChangeText={(t) =>
                  setDeliveryForm((p) => ({ ...p, pincode: t }))
                }
              />
            </View>
          )}
        </View>

        {/* ---------------- ITEMS ---------------- */}
        <View style={styles.card}>
          <View style={styles.rowHead}>
            <Ionicons name="cube-outline" size={20} color="#1f6feb" />
            <Text style={styles.cardTitle}>Order Summary</Text>
          </View>

          {loadingItems ? (
            <ActivityIndicator style={{ padding: 20 }} />
          ) : items.length === 0 ? (
            <Text style={{ color: "#444" }}>Your cart is empty.</Text>
          ) : (
            items.map((it) => (
              <View key={it.id} style={styles.itemRow}>
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

        {/* ---------------- PAYMENT ---------------- */}
        <View style={styles.card}>
          <View style={styles.rowHead}>
            <Ionicons name="card-outline" size={20} color="#1f6feb" />
            <Text style={styles.cardTitle}>Payment</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.payBox,
              paymentMethod === "cod" && styles.payActive,
            ]}
            onPress={() => setPaymentMethod("cod")}
          >
            <Ionicons name="cash-outline" size={20} color="#1f6feb" />
            <Text style={styles.payText}>Cash on Delivery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.payBox,
              paymentMethod === "online" && styles.payActive,
            ]}
            onPress={() => setPaymentMethod("online")}
          >
            <Ionicons
              name="phone-portrait-outline"
              size={20}
              color="#1f6feb"
            />
            <Text style={styles.payText}>Online Payment</Text>
          </TouchableOpacity>
        </View>

        {/* ---------------- PRICE ---------------- */}
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

          <Text style={styles.tax}>Including all taxes</Text>

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.totalLeft}>Total Payable</Text>
            <Text style={styles.totalRight}>₹{payable}</Text>
          </View>
        </View>
      </ScrollView>

      {/* ---------------- BOTTOM BAR ---------------- */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Payable</Text>
          <Text style={styles.bottomPrice}>₹{payable}</Text>
        </View>

        <TouchableOpacity
          disabled={placing}
          style={styles.placeBtn}
          onPress={() =>
            paymentMethod === "cod"
              ? placeOrderCOD()
              : startOnlinePayment()
          }
        >
          <Text style={styles.placeTxt}>
            {placing
              ? "Processing..."
              : paymentMethod === "cod"
              ? "Place Order"
              : `Pay ₹${payable}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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
  switchLabel: { fontSize: 15 },

  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: "#fff",
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  prodImg: {
    width: 80,
    height: 80,
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
    borderColor: "#e6e9f0",
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
  tax: { marginTop: 6, color: "#666", fontSize: 12 },

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
    alignItems: "center",
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
