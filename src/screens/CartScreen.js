// CartScreen.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import useUser from "../hooks/useUser";

// ⭐ FIX: Firebase Auth IMPORT
import { db } from "../firebaseConfig";

const STORAGE_KEY = "sfy_cart_v1";

const BRAND = {
  primary: "#2563eb",
  accent: "#fbbf24",
  success: "#10b981",
  danger: "#ef4444",
  surface: "#ffffff",
  bg: "#f6f7fb",
};

const FREE_DELIVERY_THRESHOLD = 499;

export default function CartScreen() {
  const navigation = useNavigation();
const { user, loading } = useUser(); // ⭐ सही जगह यही है
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [youSave, setYouSave] = useState(0);
  const [itemsCount, setItemsCount] = useState(0);

  // ------------ LOAD CART -------------
  const loadCart = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const items = raw ? JSON.parse(raw) : [];

      const normalized = items.map((it) => ({
        ...it,
        quantity: it.quantity > 0 ? it.quantity : 1,
      }));

      setCart(normalized);

      let sub = 0, save = 0, count = 0;

      normalized.forEach((it) => {
        const price = Number(it.price || 0);
        const cp = Number(it.comparePrice || 0);
        const q = Number(it.quantity || 1);

        sub += price * q;
        save += Math.max(0, cp - price) * q;
        count += q;
      });

      setSubtotal(sub);
      setYouSave(save);
      setItemsCount(count);
    } catch (err) {
      console.warn("Cart load failed", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  const persistCart = async (updated) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    loadCart();
  };

  // UPDATE QTY
  const updateQty = async (identifier, type) => {
    const updated = cart.map((it) => {
      const key = it.slug ?? it.id;
      if (key === identifier) {
        const q = it.quantity;
        if (type === "inc") return { ...it, quantity: q + 1 };
        if (type === "dec") return { ...it, quantity: q > 1 ? q - 1 : 1 };
      }
      return it;
    });

    await persistCart(updated);
  };

  const removeItem = (identifier) => {
    Alert.alert("Remove Item", "Remove this product from cart?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const updated = cart.filter((it) => (it.slug ?? it.id) !== identifier);
          await persistCart(updated);
        },
      },
    ]);
  };

  const saveForLater = async (identifier) => {
    const updated = cart.filter((it) => (it.slug ?? it.id) !== identifier);
    await persistCart(updated);
    Alert.alert("Saved", "Item moved to save for later.");
  };

  const checkout = () => {
  if (!cart.length) {
    Alert.alert("Cart Empty", "Add items before checkout.");
    return;
  }

  if (loading) return;

  // ❗ User NOT logged in → send to login WITH redirect
  if (!user) {
    navigation.navigate("Login", { redirectTo: "CheckoutScreen" });
    return;
  }

  // ❗ User logged in → go to Checkout screen
  navigation.navigate("CheckoutScreen");
};


  const deliveryProgress = Math.min(1, subtotal / FREE_DELIVERY_THRESHOLD);
  const amountLeft = subtotal >= FREE_DELIVERY_THRESHOLD
    ? 0
    : FREE_DELIVERY_THRESHOLD - subtotal;

  const renderItem = ({ item }) => {
    const idKey = item.slug ?? item.id;
    const img =
      item?.images?.[0]?.url ||
      item.image ||
      null;

    const price = Number(item.price);
    const cp = Number(item.comparePrice);
    const discount = cp > 0 ? Math.round(((cp - price) / cp) * 100) : 0;

    return (
      <View style={styles.itemCard}>
        <Image
          source={img ? { uri: img } : { uri: "" }}
          style={styles.itemImage}
          resizeMode="contain"
        />

        <View style={styles.itemBody}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name || "Product"}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>₹{price}</Text>
            {!!cp && <Text style={styles.mrp}>₹{cp}</Text>}
            {!!discount && <Text style={styles.offBadge}>{discount}% Off</Text>}
          </View>

          <View style={styles.controlsRow}>
            <View style={styles.qtyBox}>
              <TouchableOpacity
                style={styles.qtyAction}
                onPress={() => updateQty(idKey, "dec")}
              >
                <Text style={styles.qtyActionText}>−</Text>
              </TouchableOpacity>

              <View style={styles.qtyValueWrap}>
                <Text style={styles.qtyValue}>{item.quantity}</Text>
              </View>

              <TouchableOpacity
                style={styles.qtyAction}
                onPress={() => updateQty(idKey, "inc")}
              >
                <Text style={styles.qtyActionText}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.trashBtn}
              onPress={() => removeItem(idKey)}
            >
              <Text style={styles.trashText}>🗑️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity onPress={() => removeItem(idKey)}>
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => saveForLater(idKey)}>
              <Text style={styles.actionText}>Save for later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BRAND.bg }}>
      <View style={styles.screen}>
        
        {/* Top subtotal box */}
        <View style={styles.subtotalArea}>
          <Text style={styles.subtotalText}>
            Subtotal ({itemsCount} items):{" "}
            <Text style={styles.subtotalAmount}>₹{subtotal}</Text>
          </Text>

          <View style={styles.freeDeliveryRow}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${deliveryProgress * 100}%` },
                ]}
              />
            </View>

            {subtotal >= FREE_DELIVERY_THRESHOLD ? (
              <Text style={styles.freeDeliveryText}>
                FREE Delivery unlocked! 🎉
              </Text>
            ) : (
              <Text style={styles.freeDeliveryText}>
                Add ₹{amountLeft} more for FREE Delivery
              </Text>
            )}
          </View>

          <TouchableOpacity style={styles.proceedBtn} onPress={checkout}>
            <Text style={styles.proceedText}>
              Proceed to Buy ({itemsCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cart List */}
        <FlatList
          data={cart}
          keyExtractor={(it) => (it.slug ?? it.id ?? Math.random() + "")}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Your Cart is Empty</Text>
            </View>
          }
        />

        {/* Bottom summary */}
        <View style={styles.footer}>
          <View style={styles.totalsLeft}>
            <Text style={styles.totalsLabel}>Total</Text>
            <Text style={styles.totalsAmount}>₹{subtotal}</Text>
            {!!youSave && (
              <Text style={styles.youSave}>You Save ₹{youSave}</Text>
            )}
          </View>

          <TouchableOpacity style={styles.checkoutBtn} onPress={checkout}>
            <Text style={styles.checkoutBtnText}>Checkout</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

/* 💠 Styling (unchanged) */
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BRAND.bg },

  subtotalArea: {
    padding: 12,
    backgroundColor: BRAND.surface,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  subtotalText: { fontSize: 18, fontWeight: "700", color: "#111" },
  subtotalAmount: { fontSize: 20, fontWeight: "900", color: BRAND.primary },

  freeDeliveryRow: { marginTop: 8 },
  progressBarBg: {
    height: 8, backgroundColor: "#e6f4ea", borderRadius: 8, marginVertical: 6,
  },
  progressBarFill: {
    height: "100%", backgroundColor: BRAND.success,
  },
  freeDeliveryText: {
    color: "#064e3b", fontSize: 13, fontWeight: "600",
  },

  proceedBtn: {
    marginTop: 10,
    backgroundColor: BRAND.accent,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
  },
  proceedText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  listContent: { padding: 12, paddingBottom: 120 },

  itemCard: {
    flexDirection: "row",
    backgroundColor: BRAND.surface,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    shadowOpacity: 0.05,
    elevation: 2,
  },
  itemImage: {
    width: width * 0.22,
    height: width * 0.22,
    borderRadius: 6,
  },

  itemBody: { flex: 1, marginLeft: 12 },

  itemName: { fontSize: 15, fontWeight: "700", color: "#111" },

  priceRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  currentPrice: { fontSize: 16, fontWeight: "900", color: BRAND.primary },
  mrp: {
    fontSize: 13, color: "#6b7280",
    textDecorationLine: "line-through",
    marginLeft: 6,
  },
  offBadge: {
    fontSize: 12, marginLeft: 8,
    color: BRAND.danger, fontWeight: "700",
  },

  controlsRow: { flexDirection: "row", marginTop: 10 },
  qtyBox: {
    flexDirection: "row",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f59e0b44",
  },

  qtyAction: { paddingHorizontal: 12 },
  qtyActionText: { fontSize: 20, fontWeight: "800" },

  qtyValueWrap: { width: 40, alignItems: "center" },
  qtyValue: { fontSize: 16, fontWeight: "700" },

  trashBtn: { marginLeft: 12 },
  trashText: { fontSize: 22 },

  actionRow: { flexDirection: "row", marginTop: 10 },
  actionText: { marginRight: 16, fontWeight: "700", color: "#374151" },

  emptyBox: { padding: 50, alignItems: "center" },
  emptyText: { fontSize: 18, fontWeight: "700", color: "#9ca3af" },

  footer: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    padding: 12,
    flexDirection: "row",
    backgroundColor: BRAND.surface,
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  totalsLeft: { flex: 1 },
  totalsLabel: { fontSize: 12, color: "#6b7280" },
  totalsAmount: { fontSize: 18, fontWeight: "900", color: BRAND.primary },
  youSave: { fontSize: 12, color: BRAND.success },

  checkoutBtn: {
    backgroundColor: BRAND.accent,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  checkoutBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
});
