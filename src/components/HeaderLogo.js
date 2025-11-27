import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function HeaderLogo() {
  return (
    <View style={styles.row}>
      <Image
        source={require("../assets/logo.png")}   // ⭐ Tumhara S wala logo
        style={styles.logo}
      />
      <Text style={styles.text}>fyKart</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    marginRight: 6,
  },
  text: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },
});
