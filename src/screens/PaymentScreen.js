// screens/PaymentScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db, auth } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function PaymentScreen({ route, navigation }) {
  const { selectedAddress } = route.params; // from checkout page
  const [blockedPins, setBlockedPins] = useState({});
  const [selectedPayment, setSelectedPayment] = useState("prepaid");

  const pincode = selectedAddress?.pincode;

  // 🔥 Fetch Blocked Pincodes From Admin Panel Collection
  const fetchBlockedPincodes = async () => {
    const ref = doc(db, "admin", "blockedCodPincodes");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setBlockedPins(snap.data()?.pincodes || {}); // {"273212": true, ...}
    }
  };

  useEffect(() => {
    fetchBlockedPincodes();
  }, []);

  // Check if COD available
  const codBlocked = blockedPins[pincode] === true;

  const handlePayment = () => {
    if (selectedPayment === "cod" && codBlocked) {
      Alert.alert("COD Not Available", "COD is not available for this pincode.");
      return;
    }

    navigation.navigate("ThankYou", {
  paymentType: selectedPayment,
});

  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.header}>Choose Payment Method</Text>

        {/* 🔵 PREPAID PAYMENT OPTION */}
        <TouchableOpacity
          style={[
            styles.option,
            selectedPayment === "prepaid" && styles.optionSelected,
          ]}
          onPress={() => setSelectedPayment("prepaid")}
        >
          <Text style={styles.title}>Prepaid / Online Payment</Text>
          <Text style={styles.subText}>Pay securely using UPI / Cards</Text>
        </TouchableOpacity>

        {/* 🔴 COD OPTION (Disabled if blocked) */}
        <TouchableOpacity
          style={[
            styles.option,
            codBlocked && styles.optionDisabled,
            selectedPayment === "cod" && !codBlocked && styles.optionSelected,
          ]}
          disabled={codBlocked}
          onPress={() => setSelectedPayment("cod")}
        >
          <Text style={styles.title}>Cash On Delivery</Text>

          {codBlocked ? (
            <Text style={[styles.subText, { color: "red" }]}>
              COD not available in your area
            </Text>
          ) : (
            <Text style={styles.subText}>Pay when the product arrives</Text>
          )}
        </TouchableOpacity>

        {/* PAY BUTTON */}
        <TouchableOpacity style={styles.btn} onPress={handlePayment}>
          <Text style={styles.btnText}>
            {selectedPayment === "cod" ? "Place COD Order" : "Pay ₹ Online"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 16,
    color: "#111",
  },
  option: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  optionSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  optionDisabled: {
    opacity: 0.5,
    backgroundColor: "#f3f4f6",
  },
  title: { fontSize: 16, fontWeight: "800" },
  subText: { color: "#6b7280", marginTop: 4 },
  btn: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
