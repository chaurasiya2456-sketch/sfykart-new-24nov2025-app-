import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useUser from "../hooks/useUser";

export default function RefundStatus() {
  const user = useUser();
  const refunds = user?.refunds || []; // refunds array from Firebase / AsyncStorage

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <Text style={styles.header}>Refund Status</Text>

        {/* EMPTY VIEW */}
        {refunds.length === 0 ? (
          <Text style={styles.emptyText}>No refund requests found.</Text>
        ) : (
          refunds.map((item, index) => (
            <View key={index} style={styles.refundBox}>
              
              {/* ORDER ID */}
              <Text style={styles.orderId}>Order ID: {item.orderId}</Text>

              {/* STATUS LABEL */}
              <Text
                style={[
                  styles.refundStatus,
                  item.status === "success"
                    ? styles.success
                    : item.status === "pending"
                    ? styles.pending
                    : styles.failed,
                ]}
              >
                {item.status === "success"
                  ? "Refund Successful"
                  : item.status === "pending"
                  ? "Refund In Process"
                  : "Refund Failed"}
              </Text>

              {/* AMOUNT */}
              <Text style={styles.amount}>₹{item.amount} refunded</Text>

              {/* CREDIT MESSAGE */}
              {item.status === "success" && (
                <Text style={styles.creditMsg}>
                  Amount has been credited to your account.
                </Text>
              )}

              {/* REFUND REASON */}
              {item.reason ? (
                <Text style={styles.reason}>Reason: {item.reason}</Text>
              ) : null}

              {/* DATE */}
              <Text style={styles.date}>
                {item.status === "pending" ? "Requested on" : "Refunded on"}:{" "}
                {item.date}
              </Text>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ------------------ STYLES ------------------ */

const styles = StyleSheet.create({
  container: {
    padding: 14,
  },

  header: {
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    color: "#2563eb",
    marginBottom: 15,
    marginTop: 5,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#777",
    fontWeight: "600",
  },

  refundBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  orderId: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },

  refundStatus: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontWeight: "800",
    alignSelf: "flex-start",
  },

  success: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
  },

  pending: {
    backgroundColor: "#fff7cd",
    color: "#eab308",
  },

  failed: {
    backgroundColor: "#ffe5e5",
    color: "#dc2626",
  },

  amount: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "900",
    color: "#2563eb",
  },

  creditMsg: {
    marginTop: 6,
    color: "#16a34a",
    fontWeight: "700",
  },

  reason: {
    marginTop: 8,
    color: "#444",
    fontSize: 14,
    fontWeight: "500",
  },

  date: {
    marginTop: 8,
    color: "#666",
    fontSize: 13,
    fontWeight: "600",
  },
});
