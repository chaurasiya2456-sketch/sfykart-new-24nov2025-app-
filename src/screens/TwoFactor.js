// screens/TwoFactor.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function TwoFactor() {
  const [enabled, setEnabled] = useState(false);
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const sendOTP = () => {
    if (phone.length < 10) {
      Alert.alert("Error", "Enter a valid mobile number.");
      return;
    }
    setOtpSent(true);
    Alert.alert("OTP Sent", "An OTP has been sent to your mobile.");
  };

  const verifyOTP = () => {
    if (otp.length < 4) {
      Alert.alert("Error", "Enter the OTP sent to your mobile.");
      return;
    }
    Alert.alert("Success", "Two-step verification enabled!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Two-Step Verification</Text>

      <Text style={styles.desc}>
        Add an extra layer of security to your SfyKart account. Enable OTP
        verification during login.
      </Text>

      {/* Toggle */}
      <TouchableOpacity
        style={styles.toggleBox}
        onPress={() => setEnabled(!enabled)}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons
            name={enabled ? "shield-checkmark" : "shield-outline"}
            size={30}
            color={enabled ? "#10b981" : "#6b7280"}
          />
          <Text style={styles.toggleLabel}>
            {enabled ? "Two-step is ON" : "Two-step is OFF"}
          </Text>
        </View>

        <Ionicons
          name={enabled ? "toggle" : "toggle-outline"}
          size={40}
          color={enabled ? "#10b981" : "#6b7280"}
        />
      </TouchableOpacity>

      {/* Form */}
      {enabled && (
        <View style={styles.form}>
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter mobile number"
            keyboardType="number-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />

          {!otpSent ? (
            <TouchableOpacity style={styles.btn} onPress={sendOTP}>
              <Text style={styles.btnText}>Send OTP</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={styles.label}>Enter OTP</Text>
              <TextInput
                style={styles.input}
                placeholder="4 Digit OTP"
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
              />

              <TouchableOpacity style={styles.btn} onPress={verifyOTP}>
                <Text style={styles.btnText}>Verify & Enable</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9fafb" },
  title: { fontSize: 22, fontWeight: "900", color: "#2563eb", marginBottom: 10 },
  desc: { color: "#555", fontSize: 15, marginBottom: 20 },
  toggleBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleLabel: { marginLeft: 12, fontSize: 16, fontWeight: "700" },
  form: {
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  label: { fontSize: 14, fontWeight: "700", marginBottom: 6 },
  input: {
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  btn: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "800" },
});
