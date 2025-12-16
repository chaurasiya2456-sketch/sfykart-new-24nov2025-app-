import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ThankYou({ route, navigation }) {
  const orderId = route.params?.orderId;

  // 🔥 BLOCK BACK BUTTON (Android)
  useEffect(() => {
    const back = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => back.remove();
  }, []);

  // ❌ Removed the infinite-loop reset() here

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* ✔ Success Icon */}
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/845/845646.png",
          }}
          style={styles.successIcon}
        />

        <Text style={styles.title}>Thank You for Choosing SfyKart! 🎉</Text>

        <View style={styles.card}>
          <Text style={styles.successTxt}>Order Placed Successfully</Text>
          <Text style={styles.orderId}>Order ID: {orderId}</Text>

          <Text style={styles.msg}>
            Your order has been confirmed.  
            We’re preparing your package and will update you soon.
          </Text>
        </View>

        {/* ⭐ View Orders */}
        <TouchableOpacity
  style={styles.primaryBtn}
  onPress={() =>
    navigation.navigate("Tabs", {
      screen: "Profile",
      params: { screen: "Orders" },
    })
  }
>

          <Text style={styles.primaryTxt}>View My Orders</Text>
        </TouchableOpacity>

        {/* ⭐ Continue Shopping → HOME TAB */}
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: "Tabs" }],
            })
          }
        >
          <Text style={styles.secondaryTxt}>Continue Shopping</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f0f4ff" },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  successIcon: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    color: "#1f6feb",
    marginBottom: 15,
  },

  card: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
    elevation: 4,
    marginBottom: 20,
    alignItems: "center",
  },

  successTxt: {
    fontSize: 20,
    fontWeight: "800",
    color: "#16a34a",
  },

  orderId: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },

  msg: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
    color: "#555",
  },

  primaryBtn: {
    width: "100%",
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
    elevation: 2,
  },

  primaryTxt: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
  },

  secondaryBtn: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2563eb",
  },

  secondaryTxt: {
    color: "#2563eb",
    fontSize: 16,
    fontWeight: "800",
  },
});
