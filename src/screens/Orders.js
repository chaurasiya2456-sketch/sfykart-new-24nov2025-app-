import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Orders() {
  const navigation = useNavigation();

  const [orders, setOrders] = useState([
    {
      id: "ORD12345",
      productName: "Neck Massager Pro",
      amount: 899,
      status: "Delivered",
      date: "2025-02-10",
      deliveredAt: "2025-02-10T10:00:00Z",
      address: "Gorakhpur, Uttar Pradesh",
      refund: { status: "none" },
      totalAmount: 899,
    },
    {
      id: "ORD67890",
      productName: "Pain Relief Oil",
      amount: 299,
      status: "Shipped",
      date: "2025-02-12",
      address: "Kushinagar, Uttar Pradesh",
      refund: { status: "none" },
      totalAmount: 299,
    },
  ]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f2f4f7" }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Your Orders</Text>

        {orders.map((item, index) => {
          let deliveredDiff = 100;
          if (item.deliveredAt) {
            deliveredDiff =
              (new Date() - new Date(item.deliveredAt)) /
              (1000 * 60 * 60 * 24);
          }

          return (
            <View key={index} style={styles.orderBox}>
              {/* PRESS OPEN ORDER DETAILS */}
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("OrderDetails", { order: item })
                }
              >
                <Text style={styles.orderId}>Order ID: {item.id}</Text>
                <Text style={styles.product}>{item.productName}</Text>
                <Text style={styles.amount}>₹{item.amount}</Text>
                <Text style={styles.date}>Ordered on {item.date}</Text>

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

              {/* CANCEL ORDER (Only Before Shipping) */}
              {item.status === "Confirmed" && (
                <TouchableOpacity style={styles.cancelBtn}>
                  <Text style={styles.cancelTxt}>Cancel Order</Text>
                </TouchableOpacity>
              )}

              {/* RETURN / REFUND */}
              {item.status === "Delivered" && item.refund.status === "none" && (
                deliveredDiff <= 7 ? (
                  <TouchableOpacity style={styles.returnBtn}>
                    <Text style={styles.returnTxt}>Return / Refund</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.refundExpired}>Return window closed</Text>
                )
              )}

              {/* REFUND STATUS */}
              {item.refund.status === "requested" && (
                <Text style={styles.refundPendingTxt}>Refund Requested</Text>
              )}
              {item.refund.status === "processed" && (
                <Text style={styles.refundDone}>Refund Completed</Text>
              )}
            </View>
          );
        })}

        <View style={{ height: 70 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 5,
  },

  header: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 10,
    marginBottom: 15,
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
