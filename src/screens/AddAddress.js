// screens/AddAddress.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export default function AddAddress({ navigation }) {
  const uid = auth.currentUser?.uid;

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [street, setStreet] = useState("");
  const [post, setPost] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const saveAddress = async () => {
    if (!name || !mobile || !street || !district || !state || !pincode) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const colRef = collection(db, "users", uid, "addresses");

      await addDoc(colRef, {
        name,
        mobile,
        street,
        post,
        district,
        state,
        pincode,
        isDefault: false,
      });

      Alert.alert("Success", "Address added successfully!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView style={{ padding: 16 }}>
        <Text style={styles.header}>Add New Address</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          keyboardType="numeric"
          value={mobile}
          onChangeText={setMobile}
        />
        <TextInput
          style={styles.input}
          placeholder="Street / House No"
          value={street}
          onChangeText={setStreet}
        />
        <TextInput
          style={styles.input}
          placeholder="Post Office (optional)"
          value={post}
          onChangeText={setPost}
        />
        <TextInput
          style={styles.input}
          placeholder="District"
          value={district}
          onChangeText={setDistrict}
        />
        <TextInput
          style={styles.input}
          placeholder="State"
          value={state}
          onChangeText={setState}
        />
        <TextInput
          style={styles.input}
          placeholder="Pincode"
          keyboardType="numeric"
          value={pincode}
          onChangeText={setPincode}
        />

        <TouchableOpacity style={styles.btn} onPress={saveAddress}>
          <Text style={styles.btnText}>Save Address</Text>
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
    color: "#2563eb",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  btn: {
    marginTop: 10,
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
});
