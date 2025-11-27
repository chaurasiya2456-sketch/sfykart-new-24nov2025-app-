import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function OrderDetails({ route, navigation }) {
  const { order } = route.params;

  const [liveOrder, setLiveOrder] = useState(order);

  // 🔥 Correct LIVE TRACKING (order.orderId ya order.id)
  useEffect(() => {
    const orderDocId = order.orderId || order.id; // FIXED

    const unsub = onSnapshot(doc(db, "orders", orderDocId), (snap) => {
      if (snap.exists()) {
        setLiveOrder({ ...snap.data(), id: snap.id });
      }
    });

    return () => unsub();
  }, []);

  const status = liveOrder?.status || "Processing";

  // 🔥 Correct product
  const firstItem =
    liveOrder?.items?.[0] ||
    order?.items?.[0] ||
    {};

  const productName = firstItem.title || firstItem.name || "Product";

  // 🔥 Correct amount
  const amount =
    liveOrder?.totalAmount ??
    liveOrder?.amount ??
    order?.totalAmount ??
    order?.amount ??
    0;

  // 🔥 Correct created date
  const createdAt =
    liveOrder?.createdAt?.toDate?.() ||
    new Date(liveOrder?.createdAt) ||
    new Date();

  const trackingSteps = [
    { key: "Placed", label: "Order Placed", icon: "checkmark-circle" },
    { key: "Packed", label: "Packed", icon: "cube" },
    { key: "Shipped", label: "Shipped", icon: "boat" },
    { key: "OutForDelivery", label: "Out for Delivery", icon: "car" },
    { key: "Delivered", label: "Delivered", icon: "home" },
  ];

  const currentIdx = trackingSteps.findIndex(
    (s) => s.key.toLowerCase() === status.toLowerCase()
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f2f4f7" }}>
      <ScrollView style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.headerBox}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#000" />
          </TouchableOpacity>
          <Text style={styles.header}>Order Details</Text>
        </View>

        {/* STATUS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>

          <View style={styles.row}>
            <Ionicons
              name={
                status === "Delivered"
                  ? "checkmark-circle"
                  : status === "Shipped"
                  ? "boat"
                  : "cube"
              }
              size={28}
              color={
                status === "Delivered"
                  ? "#16a34a"
                  : status === "Shipped"
                  ? "#2563eb"
                  : "#f59e0b"
              }
            />

            <View style={{ marginLeft: 12 }}>
              <Text style={styles.statusText}>{status}</Text>
              
              {/* FIXED DATE */}
              <Text style={styles.dateText}>
                {createdAt.toDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* PRODUCT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product</Text>

          {/* FIXED PRODUCT */}
          <Text style={styles.productName}>{productName}</Text>

          {/* FIXED AMOUNT */}
          <Text style={styles.amount}>₹{amount}</Text>
        </View>

        {/* TRACK SHIPMENT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Track Shipment</Text>

          {trackingSteps.map((step, index) => {
            const complete = index <= currentIdx;

            return (
              <View key={step.key}>
                <View style={styles.trackRow}>
                  <View
                    style={
                      complete
                        ? styles.trackIconBoxCompleted
                        : styles.trackIconBoxPending
                    }
                  >
                    <Ionicons
                      name={step.icon}
                      size={26}
                      color={complete ? "#2563eb" : "#9ca3af"}
                    />
                  </View>

                  <Text
                    style={complete ? styles.trackText : styles.trackTextPending}
                  >
                    {step.label}
                  </Text>
                </View>

                {index !== trackingSteps.length - 1 && (
                  <View style={styles.trackLine} />
                )}
              </View>
            );
          })}
        </View>

        {/* ORDER ID */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order ID</Text>

          {/* FIXED */}
          <Text style={styles.normalText}>
            {order.orderId || order.id}
          </Text>
        </View>

        {/* REFUND STATUS */}
        {order.refund && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Refund Status</Text>

            <View style={styles.row}>
              <Ionicons
                name={
                  order.refund.status === "processed"
                    ? "checkmark-circle"
                    : order.refund.status === "initiated"
                    ? "sync-outline"
                    : order.refund.status === "pending"
                    ? "time-outline"
                    : "close-circle"
                }
                size={28}
                color={
                  order.refund.status === "processed"
                    ? "#16a34a"
                    : order.refund.status === "initiated"
                    ? "#2563eb"
                    : order.refund.status === "pending"
                    ? "#f59e0b"
                    : "#dc2626"
                }
              />

              <View style={{ marginLeft: 12 }}>
                <Text style={styles.refundStatusText}>
                  {order.refund.status === "processed"
                    ? "Refund Completed"
                    : order.refund.status === "initiated"
                    ? "Refund Initiated"
                    : order.refund.status === "pending"
                    ? "Refund Pending"
                    : "Refund Failed"}
                </Text>

                <Text style={styles.refundDateText}>
                  {new Date(order.refund.date).toDateString()}
                </Text>
              </View>
            </View>

            <Text style={styles.refundAmount}>
              Amount: ₹{order.refund.amount}
            </Text>

            <Text style={styles.refundMethod}>
              Refunded To:{" "}
              {order.refund.method === "wallet"
                ? "SfyKart Wallet"
                : "Bank Account"}
            </Text>

            <Text style={styles.refundNote}>{order.refund.note}</Text>
          </View>
        )}

        {/* DELIVERY ADDRESS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>

          <Text style={styles.normalText}>
            {liveOrder?.deliveryAddress?.name || "N/A"}
          </Text>
          <Text style={styles.normalText}>
            {liveOrder?.deliveryAddress?.street || ""}
          </Text>
          <Text style={styles.normalText}>
            {liveOrder?.deliveryAddress?.city},{" "}
            {liveOrder?.deliveryAddress?.state}
          </Text>
          <Text style={styles.normalText}>
            Pincode: {liveOrder?.deliveryAddress?.pincode}
          </Text>
          <Text style={styles.normalText}>
            Phone: {liveOrder?.deliveryAddress?.phone}
          </Text>
        </View>

        {/* TRACK BUTTON */}
        <TouchableOpacity style={styles.trackButton}>
          <Text style={styles.trackBtnText}>Track Shipment</Text>
        </TouchableOpacity>

        {/* HELP */}
        <TouchableOpacity style={styles.helpBox}>
          <Ionicons name="help-circle-outline" size={28} color="#2563eb" />
          <Text style={styles.helpText}>Need help with this order?</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
                        STYLES (UNCHANGED)
============================================================ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },

  headerBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
  },
  header: {
    fontSize: 22,
    fontWeight: "900",
    marginLeft: 12,
  },

  section: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginTop: 12,
    elevation: 1,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
    color: "#333",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  statusText: {
    fontSize: 18,
    fontWeight: "800",
  },

  dateText: {
    fontSize: 14,
    color: "#666",
  },

  productName: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },

  amount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2563eb",
  },

  normalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
  },

  helpBox: {
    marginTop: 20,
    backgroundColor: "#e8f0ff",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  helpText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#2563eb",
  },

  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  trackIconBoxCompleted: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
  },

  trackIconBoxPending: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },

  trackText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },

  trackTextPending: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },

  trackLine: {
    height: 20,
    borderLeftWidth: 2,
    borderLeftColor: "#d1d5db",
    marginLeft: 15,
  },

  trackButton: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  trackBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },

  refundStatusText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },

  refundDateText: {
    fontSize: 14,
    color: "#666",
  },

  refundAmount: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
    color: "#2563eb",
  },

  refundMethod: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
    color: "#444",
  },

  refundNote: {
    marginTop: 6,
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
});
