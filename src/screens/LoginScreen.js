import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

// 🔥 Expo Recaptcha
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";

// 🔥 Firebase
import { PhoneAuthProvider } from "firebase/auth";
import { auth } from "../firebaseConfig";
import app from "../firebaseConfig";

import { SafeAreaView } from "react-native-safe-area-context";

const BRAND = {
  primary: "#2563eb",
  accent: "#fbbf24",
};

export default function LoginScreen() {
  const navigation = useNavigation();
  const route = useRoute(); // ⭐ redirectTo receive होगा

  const [mobile, setMobile] = useState("");
  const [otpMsg, setOtpMsg] = useState("");

  const recaptchaVerifier = useRef(null);

  const sendOTP = async () => {
    if (mobile.length !== 10) {
      alert("Please enter valid 10-digit mobile number");
      return;
    }

    try {
      const phoneProvider = new PhoneAuthProvider(auth);

      const verificationId = await phoneProvider.verifyPhoneNumber(
        "+91" + mobile,
        recaptchaVerifier.current
      );

      setOtpMsg("OTP sent successfully ✔");

      // ⭐ redirectTo आगे OTPVerify में pass होगा
      navigation.navigate("OTPVerify", {
        mobile,
        verificationId,
        redirectTo: route.params?.redirectTo || null,
      });
    } catch (error) {
      console.log("OTP ERROR:", error);
      alert(error?.message || "Could not send OTP");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* ⭐ Recaptcha Modal */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to SfyKart</Text>
          <Text style={styles.subtitle}>Login to continue</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.label}>Mobile Number</Text>

          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            maxLength={10}
            placeholder="Enter mobile number"
            value={mobile}
            onChangeText={setMobile}
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={sendOTP}>
            <Text style={styles.primaryText}>Continue</Text>
          </TouchableOpacity>

          {otpMsg ? <Text style={styles.otpMsg}>{otpMsg}</Text> : null}
        </View>

        <TouchableOpacity
          style={styles.emailBtn}
          onPress={() => navigation.navigate("EmailLogin")}
        >
          <Text style={styles.emailText}>Login with Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.googleBtn}
          onPress={() => navigation.navigate("GoogleLogin")}
        >
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createBtn}
          onPress={() =>
            navigation.navigate("CreateAccount", {
              redirectTo: route.params?.redirectTo || null,
            })
          }
        >
          <Text style={styles.createText}>
            New to SfyKart? Create Account
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: BRAND.primary,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginTop: 5,
  },
  box: {
    marginTop: 20,
    backgroundColor: "#f8f9fb",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eef0f5",
  },
  label: {
    fontSize: 15,
    color: "#444",
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
  },
  primaryBtn: {
    backgroundColor: BRAND.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
  otpMsg: {
    marginTop: 10,
    color: "green",
    fontWeight: "600",
  },
  emailBtn: {
    marginTop: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: BRAND.primary,
    borderRadius: 10,
    alignItems: "center",
  },
  emailText: {
    color: BRAND.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  googleBtn: {
    marginTop: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  googleText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#444",
  },
  createBtn: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  createText: {
    color: BRAND.accent,
    fontSize: 15,
    fontWeight: "800",
  },
});
