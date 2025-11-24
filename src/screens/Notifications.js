// screens/Notifications.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Notifications() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Notifications</Text>

      <View style={styles.card}>
        <Text style={styles.text}>No notifications right now</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9fafb" },
  header: {
    fontSize: 22,
    fontWeight: "900",
    color: "#2563eb",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    elevation: 1,
  },
  text: { color: "#555", fontSize: 16 },
});
