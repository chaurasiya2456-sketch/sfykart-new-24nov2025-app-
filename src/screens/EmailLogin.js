// screens/EmailLogin.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigation, useRoute } from "@react-navigation/native";

const BRAND = {
  primary: "#2563eb",
  accent: "#fbbf24",
};

export default function EmailLogin() {
  const navigation = useNavigation();
  const route = useRoute();

  // ⭐ Redirect values coming from ProductDetails → Login → EmailLogin
  const redirectTo = route.params?.redirectTo || null;
  const product = route.params?.product || null;

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !pass) {
      alert("Please enter email & password");
      return;
    }

    setLoading(true);

    try {
      // Firebase Email Signin
      const userCred = await signInWithEmailAndPassword(auth, email, pass);

      // Fetch user data from Firestore
      const ref = doc(db, "users", userCred.user.uid);
      const snap = await getDoc(ref);

      // If no profile → redirect to CreateAccount
      if (!snap.exists()) {
        navigation.replace("CreateAccount", {
          uid: userCred.user.uid,
          mobile: "",
        });
        return;
      }

      // ⭐⭐ CHECK REDIRECT — If coming from BUY NOW → Go to Checkout
      if (redirectTo === "CheckoutScreen") {
        navigation.replace("CheckoutScreen", {
          buyNow: true,
          product: product,
        });
        return;
      }

      // ⭐ Normal Login → Go to Tabs/Home
      navigation.replace("Tabs");

    } catch (err) {
      console.log("Email login error:", err);
      alert("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Email Login</Text>
      <Text style={styles.subtitle}>Sign in with your email account</Text>

      <View style={styles.box}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <Text style={[styles.label, { marginTop: 15 }]}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          secureTextEntry
          value={pass}
          onChangeText={setPass}
        />

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={login}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={{ marginTop: 12 }}
        onPress={() => alert("Password reset coming soon!")}
      >
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.googleBtn}
        onPress={() =>
          navigation.navigate("GoogleLogin", {
            redirectTo,
            product,
          })
        }
      >
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createBtn}
        onPress={() =>
          navigation.navigate("CreateAccount", { redirectTo, product })
        }
      >
        <Text style={styles.createText}>New to SfyKart? Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ------------------------------ STYLES ------------------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 25,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: BRAND.primary,
    marginTop: 50,
  },

  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 25,
  },

  box: {
    marginTop: 10,
    backgroundColor: "#f8f9fb",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eef1f5",
  },

  label: {
    fontSize: 15,
    color: "#444",
    fontWeight: "600",
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },

  primaryBtn: {
    backgroundColor: BRAND.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },

  primaryText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },

  forgotText: {
    color: BRAND.primary,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },

  googleBtn: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },

  googleText: {
    color: "#444",
    fontSize: 16,
    fontWeight: "700",
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
