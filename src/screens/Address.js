// screens/Address.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

export default function Address({ navigation }) {
  const [addresses, setAddresses] = useState([]);

  const uid = auth.currentUser?.uid;

  // FETCH ALL ADDRESSES
  const fetchAddresses = async () => {
    if (!uid) return;

    const colRef = collection(db, "users", uid, "addresses");
    const snap = await getDocs(colRef);

    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setAddresses(list);
  };

  useEffect(() => {
    const unsub = navigation.addListener("focus", fetchAddresses);
    return unsub;
  }, [navigation]);

  // DELETE ADDRESS
  const deleteAddress = async (id) => {
    Alert.alert("Delete Address", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "users", uid, "addresses", id));
          fetchAddresses();
        }
      }
    ]);
  };

  // SET DEFAULT
const setDefault = async (id) => {
  if (!uid) return;

  // Step 1: Set all addresses isDefault = false
  for (const a of addresses) {
    await updateDoc(doc(db, "users", uid, "addresses", a.id), {
      isDefault: false,
    });
  }

  // Step 2: Mark selected address as default = true
  await updateDoc(doc(db, "users", uid, "addresses", id), {
    isDefault: true,
  });

  // Step 3: Refresh list
  fetchAddresses();
};


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <ScrollView style={styles.container}>

        <Text style={styles.header}>Your Addresses</Text>

        {addresses.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.text}>{item.mobile}</Text>
                <Text style={styles.text}>
                  {item.street}, {item.post}, {item.district}
                </Text>
                <Text style={styles.text}>
                  {item.state} - {item.pincode}
                </Text>

                {item.isDefault && (
                  <Text style={styles.defaultTag}>DEFAULT</Text>
                )}
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() =>
                    navigation.navigate("EditAddress", { address: item })

                  }
                >
                  <Ionicons name="create-outline" size={22} color="#2563eb" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => deleteAddress(item.id)}
                >
                  <Ionicons name="trash-outline" size={22} color="#dc2626" />
                </TouchableOpacity>
              </View>
            </View>

            {!item.isDefault && (
              <TouchableOpacity
                onPress={() => setDefault(item.id)}
                style={styles.defaultBtn}
              >
                <Text style={styles.defaultBtnText}>Set as Default</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* -------- FIXED NAVIGATION HERE -------- */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("AddAddress")
}
        >
          <Text style={styles.addText}>+ Add New Address</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 14 },
  header: {
    fontSize: 22,
    fontWeight: "900",
    color: "#2563eb",
    textAlign: "center",
    marginBottom: 15
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  name: { fontSize: 16, fontWeight: "800" },
  text: { marginTop: 3, color: "#444" },
  defaultTag: {
    marginTop: 6,
    backgroundColor: "#d1fae5",
    color: "#059669",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    fontWeight: "700",
    fontSize: 12
  },
  iconBtn: { marginBottom: 12 },
  defaultBtn: {
    marginTop: 10,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center"
  },
  defaultBtnText: { color: "#fff", fontWeight: "800" },
  addBtn: {
    marginTop: 10,
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    alignItems: "center"
  },
  addText: { color: "#fff", fontWeight: "900", fontSize: 16 }
});
