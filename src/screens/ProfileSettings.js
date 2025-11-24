// screens/ProfileSettings.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,     // ✅ Added
  Image           // ✅ Added
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

// Firebase
import { auth, db } from "../firebaseConfig";   // ✅ Already correct
import { doc, getDoc, updateDoc } from "firebase/firestore";

// Storage
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ProfileSettings() {
  const navigation = useNavigation();
  const uid = auth.currentUser?.uid;

  const [loading, setLoading] = useState(true);

  // FORM STATES
  const [image, setImage] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [street, setStreet] = useState("");
  const [post, setPost] = useState("");
  const [district, setDistrict] = useState("");
  const [pincode, setPincode] = useState("");
  const [stateName, setStateName] = useState("");

  const storage = getStorage();

  // 🔥 Load live data from Firestore
  useEffect(() => {
    const loadUser = async () => {
      try {
        const snap = await getDoc(doc(db, "users", uid));

        if (snap.exists()) {
          const u = snap.data();

          setFirstName(u.firstName || "");
          setLastName(u.lastName || "");
          setEmail(u.email || "");
          setImage(u.photoURL || null);

          const a = u.billingAddress || {};
          setStreet(a.street || "");
          setPost(a.post || "");
          setDistrict(a.district || "");
          setPincode(a.pincode || "");
          setStateName(a.state || "");
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // PICK IMAGE
  const pickImage = async () => {
    let res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!res.canceled) setImage(res.assets[0].uri);
  };

  // UPLOAD IMAGE
  const uploadImage = async () => {
    if (!image || image.startsWith("https")) return image;

    const blob = await (await fetch(image)).blob();
    const prof = ref(storage, `profile/${uid}.jpg`);
    await uploadBytes(prof, blob);
    return await getDownloadURL(prof);
  };

  // SAVE PROFILE
  const saveProfile = async () => {
    try {
      const imageURL = await uploadImage();

      const updated = {
        firstName,
        lastName,
        email,
        photoURL: imageURL,

        billingAddress: {
          street,
          post,
          district,
          state: stateName,
          pincode,
        },
      };

      // Update Firestore
      await updateDoc(doc(db, "users", uid), updated);

      // Update Local Storage
      const snap = await getDoc(doc(db, "users", uid));
      await AsyncStorage.setItem("sfy_user_v1", JSON.stringify(snap.data()));

      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack();
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Unable to update profile");
    }
  };

  if (loading) {
    return (
      <SafeAreaView>
        <Text style={{ textAlign: "center", marginTop: 40 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.header}>Edit Profile</Text>

        {/* IMAGE */}
        <TouchableOpacity onPress={pickImage} style={{ alignSelf: "center" }}>
          <Image
            source={{
              uri:
                image ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={styles.profileImg}
          />
          <Text style={styles.changePhoto}>Change Photo</Text>
        </TouchableOpacity>

        {/* NAME */}
        <Text style={styles.label}>First Name</Text>
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

        <Text style={styles.label}>Last Name</Text>
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

        {/* EMAIL */}
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} />

        {/* ADDRESS */}
        <Text style={styles.label}>Full Address</Text>
        <TextInput style={styles.input} value={street} onChangeText={setStreet} multiline />

        <Text style={styles.label}>Post</Text>
        <TextInput style={styles.input} value={post} onChangeText={setPost} />

        <Text style={styles.label}>District</Text>
        <TextInput style={styles.input} value={district} onChangeText={setDistrict} />

        <Text style={styles.label}>Pincode</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          maxLength={6}
          value={pincode}
          onChangeText={(t) => setPincode(t.replace(/[^0-9]/g, ""))}
        />

        <Text style={styles.label}>State</Text>
        <TextInput style={styles.input} value={stateName} onChangeText={setStateName} />

        <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: {
    fontSize: 22,
    fontWeight: "900",
    color: "#2563eb",
    textAlign: "center",
    marginBottom: 20,
  },
  profileImg: {
    width: 110,
    height: 110,
    borderRadius: 60,
    marginBottom: 8,
  },
  changePhoto: {
    textAlign: "center",
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 10,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    marginTop: 5,
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
  },
  saveText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },
});
