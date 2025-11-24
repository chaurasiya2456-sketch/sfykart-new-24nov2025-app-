import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useUser from "../hooks/useUser";

export default function WalletScreen() {
  const user = useUser();

  const transactions = user?.transactions || [];
  const coupons = user?.coupons || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <ScrollView style={styles.container}>
        
        {/* HEADER */}
        <Text style={styles.header}>Your Wallet</Text>

        {/* TRANSACTIONS */}
        <Text style={styles.sectionTitle}>Transactions</Text>

        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>No transactions available</Text>
        ) : (
          transactions.map((item, i) => (
            <View key={i} style={styles.transactionBox}>
              <Text style={styles.transMsg}>{item.message}</Text>
              <Text
                style={[
                  styles.transAmount,
                  item.type === "credit"
                    ? styles.credit
                    : styles.debit,
                ]}
              >
                {item.type === "credit" ? "+" : "-"}₹{item.amount}
              </Text>
            </View>
          ))
        )}

        {/* COUPONS */}
        <Text style={styles.sectionTitle}>Applied Coupons</Text>

        {coupons.length === 0 ? (
          <Text style={styles.emptyText}>No coupons used</Text>
        ) : (
          coupons.map((c, i) => (
            <View key={i} style={styles.couponBox}>
              <Text style={styles.couponCode}>{c.code}</Text>
              <Text style={styles.couponMsg}>{c.message}</Text>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 15,
    textAlign: "center",
    color: "#2563eb",
  },
  sectionTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "800",
    color: "#444",
  },
  emptyText: {
    marginTop: 10,
    color: "#777",
  },
  transactionBox: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 1,
  },
  transMsg: {
    fontSize: 15,
    fontWeight: "700",
  },
  transAmount: {
    fontSize: 16,
    fontWeight: "900",
  },
  credit: {
    color: "#16a34a",
  },
  debit: {
    color: "#dc2626",
  },
  couponBox: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    elevation: 1,
  },
  couponCode: {
    fontSize: 16,
    fontWeight: "800",
  },
  couponMsg: {
    color: "#666",
  },
});
