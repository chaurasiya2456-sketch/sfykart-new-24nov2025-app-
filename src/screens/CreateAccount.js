// screens/CreateAccount.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { db } from "../firebaseConfig";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";



const BRAND = {
  primary: "#2563eb",
  accent: "#fbbf24",
};

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep","Puducherry"
];

export default function CreateAccount() {
  const route = useRoute();
  const navigation = useNavigation();
   const uid = route?.params?.uid || auth?.currentUser?.uid || null;
  const mobile =
    route?.params?.mobile ||
    auth?.currentUser?.phoneNumber?.replace("+91", "") ||
    "";



  // form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [post, setPost] = useState("");
  const [pincode, setPincode] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [country] = useState("India");

  const [loading, setLoading] = useState(false);
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // load existing user if uid present
  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        setLoading(true);
        const userRef = doc(db, "users", uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setIsEditMode(true);
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setEmail(data.email || "");
          const billing = data.billingAddress ?? data.deliveryAddress ?? {};
          setStreet(billing.street || "");
          setPost(billing.post || billing.city || "");
          setPincode(billing.pincode || "");
          setDistrict(billing.district || billing.city || "");
          setState(billing.state || "");
        }
      } catch (err) {
        console.log("Load user error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [uid]);

  const validate = () => {
    if (!firstName.trim()) {
      Alert.alert("Validation", "First name is required.");
      return false;
    }
    if (!street.trim()) {
      Alert.alert("Validation", "Full address is required.");
      return false;
    }
    if (!post.trim()) {
      Alert.alert("Validation", "Post (office/locality) is required.");
      return false;
    }
    if (!district.trim()) {
      Alert.alert("Validation", "District is required.");
      return false;
    }
    if (!pincode.trim() || pincode.length !== 6) {
      Alert.alert("Validation", "Please enter a valid 6-digit pincode.");
      return false;
    }
    if (!state.trim()) {
      Alert.alert("Validation", "Please select a State.");
      return false;
    }
    return true;
  };

  const saveProfile = async () => {
    if (!validate()) return;
    
    try {
      setLoading(true);

      const userDoc = doc(db, "users", uid);
      const payload = {
        uid,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || "",
        mobile: mobile || "",
        updatedAt: new Date().toISOString(),
        billingAddress: {
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          street: street.trim(),
          post: post.trim(),
          district: district.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          phone: mobile || "",
          city: district.trim() || "",
          createdAt: new Date().toISOString(),
        },
        deliveryAddress: {
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          street: street.trim(),
          post: post.trim(),
          district: district.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          phone: mobile || "",
          city: district.trim() || "",
          expectedDelivery: null,
        },
      };

      // if edit mode -> updateDoc else setDoc (create)
     // if edit mode -> updateDoc else setDoc (create)
if (isEditMode) {
  await updateDoc(userDoc, payload);

  // 🔥 Save locally so ProfileScreen shows name immediately
  await AsyncStorage.setItem("sfy_user_v1", JSON.stringify(payload));

  Alert.alert("Success", "Profile updated successfully.");
} else {
  await setDoc(userDoc, {
    uid,
    ...payload,
    createdAt: new Date().toISOString(),
  });

  // 🔥 Save locally
  await AsyncStorage.setItem("sfy_user_v1", JSON.stringify(payload));

  Alert.alert("Success", "Account created successfully.");
  setIsEditMode(true);
}


      // navigate to Home or Profile after save
      navigation.reset({
  index: 0,
  routes: [{ name: "Tabs" }],
});
    } catch (err) {
      console.log("Save profile error:", err);
      Alert.alert("Error", "Unable to save profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const openStatePicker = () => setStateModalVisible(true);
  const closeStatePicker = () => setStateModalVisible(false);

  const selectState = (s) => {
    setState(s);
    closeStatePicker();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            {isEditMode ? "Edit Account" : "Create Your Account"}
          </Text>

          {/* FIRST ROW: First / Last */}
          <Text style={styles.label}>First Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter first name"
            value={firstName}
            onChangeText={setFirstName}
            returnKeyType="next"
          />

          <Text style={styles.label}>Last Name (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter last name"
            value={lastName}
            onChangeText={setLastName}
            returnKeyType="next"
          />

          {/* MOBILE READONLY */}
          <Text style={styles.label}>Mobile Number *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: "#f3f4f6" }]}
            value={mobile || ""}
            editable={false}
          />

          {/* EMAIL */}
          <Text style={styles.label}>Email (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          {/* ADDRESS */}
          <Text style={styles.label}>Full Address *</Text>
          <TextInput
            style={[styles.input, { height: 90, textAlignVertical: "top" }]}
            placeholder="House no., Street, Landmark"
            value={street}
            onChangeText={setStreet}
            multiline
          />

          <Text style={styles.label}>Post (Office / Locality) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Post / Locality"
            value={post}
            onChangeText={setPost}
          />

          <Text style={styles.label}>Pin Code *</Text>
          <TextInput
            style={styles.input}
            placeholder="6-digit pincode"
            keyboardType="number-pad"
            maxLength={6}
            value={pincode}
            onChangeText={(t) => setPincode(t.replace(/[^0-9]/g, ""))}
          />

          <Text style={styles.label}>District *</Text>
          <TextInput
            style={styles.input}
            placeholder="District"
            value={district}
            onChangeText={setDistrict}
          />

          <Text style={styles.label}>State *</Text>
          <TouchableOpacity style={styles.dropdown} onPress={openStatePicker}>
            <Text style={{ color: state ? "#000" : "#6b7280" }}>
              {state || "Select State"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Country</Text>
          <TextInput
            style={[styles.input, { backgroundColor: "#f3f4f6" }]}
            value={country}
            editable={false}
          />

          {/* SAVE / UPDATE */}
          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={saveProfile}
            disabled={loading}
          >
            <Text style={styles.saveText}>
              {loading ? "Saving..." : isEditMode ? "Update Details" : "Save Details"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* STATE PICKER MODAL */}
      <Modal
        visible={stateModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeStatePicker}
      >
        <TouchableWithoutFeedback onPress={closeStatePicker}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select State</Text>
          <ScrollView showsVerticalScrollIndicator>
            {STATES.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.modalItem}
                onPress={() => selectState(s)}
              >
                <Text style={styles.modalItemText}>{s}</Text>
              </TouchableOpacity>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ===========================
      Styles
   =========================== */
const styles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: "900",
    color: BRAND.primary,
    textAlign: "center",
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 15,
  },
  dropdown: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
  },

  saveBtn: {
    marginTop: 22,
    backgroundColor: BRAND.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalContent: {
    maxHeight: "55%",
    backgroundColor: "#fff",
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111",
    marginBottom: 8,
    textAlign: "center",
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#f1f1f1",
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
