// screens/Orders.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  BackHandler,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

// ⭐ FIREBASE
import { auth, db } from "../firebaseConfig";
import { collection, query, where, orderBy, getDocs, setDoc, doc } from "firebase/firestore";

import { Ionicons } from "@expo/vector-icons";

export default function Orders() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐ Load Orders
  const loadOrders = async () => {
    try {
      setLoading(true);
      const uid = auth.currentUser?.uid;

      if (!uid) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "orders"),
        where("userId", "==", uid),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);

      const list = snap.docs.map((d) => {
        const data = d.data();

        return {
          id: d.id,
          orderId: data.orderId || d.id,
          items: data.items || [],
          totalAmount: data.totalAmount ?? data.amount ?? 0,
          amount: data.totalAmount ?? data.amount ?? 0,
          status: data.status || data.paymentStatus || "Pending",
          paymentStatus: data.paymentStatus || (data.status === "Paid" ? "PAID" : "COD"),
          createdAt: data.createdAt || null,
          billingAddress: data.billingAddress || {},
          deliveryAddress: data.deliveryAddress || {},
          refundStatus: data.refundStatus || null,
          deliveredAt: data.deliveredAt || data.deliveredOn || null,
          raw: data,
        };
      });

      setOrders(list);
    } catch (e) {
      console.log("ERROR loading orders: ", e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // ⭐ Android hardware back
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        navigation.goBack();
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

  // ⭐ Cancel Order Handler (COD only)
  const handleCancelOrder = async (order) => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?\n\nWe’ll inform the seller instantly and your order will be safely cancelled.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await setDoc(
                doc(db, "orders", order.id),
                {
                  status: "Cancelled",
                  cancelledAt: new Date(),
                },
                { merge: true }
              );

              Alert.alert(
                "Order Cancelled ❤️",
                "Your order has been cancelled.\n\nWe hope you find something perfect for you next time!"
              );

              loadOrders();
            } catch (e) {
              console.log("Cancel error:", e);
              Alert.alert("Error", "Something went wrong. Please try again.");
            }
          },
        },
      ]
    );
  };

  const formatDate = (createdAt) => {
    try {
      if (!createdAt) return "N/A";

      if (createdAt?.toDate) return createdAt.toDate().toDateString();

      const dt = new Date(createdAt);
      if (!isNaN(dt)) return dt.toDateString();

      return "N/A";
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f2f4f7" }}>

      {/* HEADER ROW */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 12 }}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.header}>Your Orders</Text>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {loading ? (
          <ActivityIndicator style={{ marginTop: 50 }} />
        ) : orders.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 50, color: "#777" }}>
            No orders found
          </Text>
        ) : null}

        {orders.map((item, index) => {
          let deliveredDiff = 100;

          const deliveredAtVal = item.deliveredAt || item.raw?.deliveredAt || null;
          if (deliveredAtVal) {
            const deliveredDate =
              deliveredAtVal?.toDate ? deliveredAtVal.toDate() : new Date(deliveredAtVal);
            deliveredDiff = (new Date() - deliveredDate) / (1000 * 60 * 60 * 24);
          }

          const firstTitle =
            item.items?.[0]?.title ||
            item.items?.[0]?.name ||
            item.raw?.items?.[0]?.title ||
            "Product";

          return (
            <View key={item.orderId || item.id || index} style={styles.orderBox}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("OrderDetails", {
                    order: item,
                  })
                }
              >
                <Text style={styles.orderId}>Order ID: {item.orderId || item.id}</Text>

                <Text style={styles.product}>{firstTitle}</Text>

                <Text style={styles.amount}>₹{item.totalAmount}</Text>

                <Text style={styles.date}>Ordered on {formatDate(item.createdAt)}</Text>

                <Text
                  style={[
                    styles.status,
                    item.status === "Delivered"
                      ? styles.delivered
                      : item.status === "Shipped"
                      ? styles.shipped
                      : item.status === "Cancelled"
                      ? styles.cancelled
                      : styles.processing,
                  ]}
                >
                  {item.status}
                </Text>
              </TouchableOpacity>

           
              {item.paymentStatus === "COD" &&
                (item.status === "Pending" ||
                  item.status === "Processing" ||
                  item.status === "Confirmed") && (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => handleCancelOrder(item)}
                  >
                    <Text style={styles.cancelTxt}>Cancel Order</Text>
                  </TouchableOpacity>
                )}

            
              {item.status === "Delivered" &&
                !item.refundStatus &&
                deliveredDiff <= 7 && (
                  <TouchableOpacity style={styles.returnBtn}>
                    <Text style={styles.returnTxt}>Return / Refund</Text>
                  </TouchableOpacity>
                )}

              {item.status === "Delivered" &&
                deliveredDiff > 7 &&
                !item.refundStatus && (
                  <Text style={styles.refundExpired}>Return window closed</Text>
                )}

              {item.refundStatus === "requested" && (
                <Text style={styles.refundPendingTxt}>Refund Requested</Text>
              )}

              {item.refundStatus === "processed" && (
                <Text style={styles.refundDone}>Refund Completed</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 5,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  header: {
    fontSize: 22,
    fontWeight: "900",
    marginLeft: 10,
    color: "#2563eb",
  },

  orderBox: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },

  orderId: { fontSize: 14, fontWeight: "700", color: "#444" },
  product: { marginTop: 8, fontSize: 16, fontWeight: "800" },
  amount: { marginTop: 5, fontSize: 16, color: "#2563eb", fontWeight: "900" },
  date: { marginTop: 3, color: "#666" },

  status: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontWeight: "700",
    color: "#fff",
    alignSelf: "flex-start",
  },
  delivered: { backgroundColor: "#16a34a" },
  shipped: { backgroundColor: "#2563eb" },
  cancelled: { backgroundColor: "#dc2626" },
  processing: { backgroundColor: "#f59e0b" },

  cancelBtn: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelTxt: { color: "#dc2626", fontWeight: "800" },

  returnBtn: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#dbeafe",
    borderRadius: 8,
    alignItems: "center",
  },
  returnTxt: { color: "#2563eb", fontWeight: "800" },

  refundPendingTxt: {
    marginTop: 10,
    color: "#f59e0b",
    fontWeight: "700",
  },
  refundDone: {
    marginTop: 10,
    color: "#16a34a",
    fontWeight: "700",
  },
  refundExpired: {
    marginTop: 10,
    color: "#6b7280",
    fontWeight: "700",
  },
});
