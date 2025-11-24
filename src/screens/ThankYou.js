import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ThankYou({ route, navigation }) {
  const orderId = route.params?.orderId;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.icon}>🎉</Text>
        <Text style={styles.title}>Order Successful!</Text>
        <Text style={styles.msg}>Your order #{orderId} is confirmed.</Text>

        <TouchableOpacity 
          style={styles.btn}
          onPress={() => navigation.navigate("Orders")}
        >
          <Text style={styles.btnText}>View Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, styles.outlineBtn]}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={[styles.btnText, styles.outlineText]}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f6f9ff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  icon: { fontSize: 50 },
  title: { fontSize: 28, fontWeight: "900", marginTop: 10 },
  msg: { marginTop: 8, fontSize: 15, color: "#555" },
  btn: {
    marginTop: 20,
    backgroundColor: "#2563eb",
    padding: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  outlineBtn: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#2563eb",
    marginTop: 10,
  },
  outlineText: { color: "#2563eb" },
});
