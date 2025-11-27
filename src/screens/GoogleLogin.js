// screens/GoogleLogin.js
import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { auth, db } from "../firebaseConfig";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigation, useRoute } from "@react-navigation/native";

WebBrowser.maybeCompleteAuthSession();

const BRAND = {
  primary: "#2563eb",
  accent: "#fbbf24",
};

export default function GoogleLogin() {
  const navigation = useNavigation();
  const route = useRoute();

  // ⭐ Redirect values coming from Login / ProductDetails
  const redirectTo = route.params?.redirectTo || null;
  const product = route.params?.product || null;

  // Google Auth Session
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId:
      "967328398147-8o5fmj16tijolt8ehhnm35rbfum5hbtu.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleGoogleAuth(id_token);
    }
  }, [response]);

  const handleGoogleAuth = async (idToken) => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCred = await signInWithCredential(auth, credential);

      const userRef = doc(db, "users", userCred.user.uid);
      const snap = await getDoc(userRef);

      /* ------------------------------------------------
           NEW USER → Create profile → Redirect
      ------------------------------------------------ */
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: userCred.user.uid,
          firstName: userCred.user.displayName?.split(" ")[0] || "",
          lastName: userCred.user.displayName?.split(" ")[1] || "",
          email: userCred.user.email,
          mobile: "",
          loginMethod: "google",
          createdAt: new Date(),
          deliveryAddress: null,
          billingAddress: null,
        });

        return navigation.replace("CreateAccount", {
          uid: userCred.user.uid,
          mobile: "",
          redirectTo: redirectTo,
          product: product,
        });
      }

      /* ------------------------------------------------
           OLD USER → CHECK REDIRECT
      ------------------------------------------------ */
      if (redirectTo === "CheckoutScreen") {
        return navigation.replace("CheckoutScreen", {
          buyNow: true,
          product: product,
        });
      }

      // Normal Login → Go to Tabs/Home
      navigation.replace("Tabs");

    } catch (error) {
      console.log("Google login failed:", error);
      alert("Google login failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Continue with Google</Text>

      <TouchableOpacity
        style={styles.googleBtn}
        disabled={!request}
        onPress={() => promptAsync()}
      >
        <Text style={styles.googleText}>Sign in with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 25,
    justifyContent: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    color: BRAND.primary,
    marginBottom: 30,
    textAlign: "center",
  },

  googleBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
  },

  googleText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#444",
  },

  backBtn: {
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  backText: {
    color: BRAND.accent,
    fontSize: 16,
    fontWeight: "800",
  },
});
