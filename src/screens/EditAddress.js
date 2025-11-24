// screens/EditAddress.js
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
import { doc, updateDoc } from "firebase/firestore";

export default function EditAddress({ route, navigation }) {
  const { address } = route.params || {};

  if (!address) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No address data found.</Text>
      </View>
    );
  }

  const uid = auth.currentUser?.uid;

  const [name, setName] = useState(address.name);
  const [mobile, setMobile] = useState(address.mobile);
  const [street, setStreet] = useState(address.street);
  const [post, setPost] = useState(address.post);
  const [district, setDistrict] = useState(address.district);
  const [state, setState] = useState(address.state);
  const [pincode, setPincode] = useState(address.pincode);

  const updateAddress = async () => {
    try {
      const docRef = doc(db, "users", uid, "addresses", address.id);

      await updateDoc(docRef, {
        name,
        mobile,
        street,
        post,
        district,
        state,
        pincode,
      });

      Alert.alert("Success", "Address updated successfully!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView style={{ padding: 16 }}>
        <Text style={styles.header}>Edit Address</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          value={mobile}
          keyboardType="numeric"
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
          value={pincode}
          keyboardType="numeric"
          onChangeText={setPincode}
        />

        <TouchableOpacity style={styles.btn} onPress={updateAddress}>
          <Text style={styles.btnText}>Update Address</Text>
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
