import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OTPVerify({ route, navigation }) {
  const { verificationId, mobile, redirectTo } = route.params;  // ⭐ redirectTo receive

  const [otp, setOtp] = useState("");

  const verifyOTP = async () => {
    try {
      const credential = PhoneAuthProvider.credential(
        verificationId,
        otp
      );

      await signInWithCredential(auth, credential);

      alert("Login Successful!");

      // ⭐ Redirect: if coming from checkout → go back to Checkout
      navigation.replace(redirectTo || "Tabs");

    } catch (error) {
      console.log("VERIFY ERROR:", error);
      alert("Invalid OTP");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>

      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="Enter 6-digit OTP"
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity style={styles.btn} onPress={verifyOTP}>
        <Text style={styles.btnText}>Verify</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "900", marginVertical: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    fontSize: 17,
  },
  btn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
