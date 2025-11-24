// screens/PrivacySecurity.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebaseConfig";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";

export default function PrivacySecurity({ navigation }) {
  const user = auth.currentUser;
  const uid = user?.uid;

  const [loading, setLoading] = useState(false);
  const [loginActivity, setLoginActivity] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchLoginActivity();
  }, []);

  // Fetch login activity from Firestore: users/{uid}/logins (if exists)
  const fetchLoginActivity = async () => {
    if (!uid) return;
    try {
      setLoading(true);
      const col = collection(db, "users", uid, "logins");
      const q = query(col, orderBy("time", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setLoginActivity(list);
    } catch (err) {
      console.warn("fetchLoginActivity:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Change Password flow (requires reauth)
  const handleChangePassword = async () => {
    if (!user?.email) {
      Alert.alert("Error", "No email available for current user.");
      return;
    }
    if (!currentPassword || !newPassword) {
      Alert.alert("Error", "Please fill both current and new password.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);

      await updatePassword(user, newPassword);
      Alert.alert("Success", "Password updated successfully.");
      setShowChangePassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.warn("changePassword:", err);
      if (err.code === "auth/wrong-password") {
        Alert.alert("Error", "Current password is incorrect.");
      } else {
        Alert.alert("Error", err.message || "Unable to change password.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Open app settings for permissions
  const openAppSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings();
    }
  };

  // Open privacy policy url
  const openPrivacyPolicy = () => {
    const url = "https://yourdomain.com/privacy-policy"; // replace with real URL
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Unable to open link.");
    });
  };

  // Open terms & conditions
  const openTerms = () => {
    const url = "https://yourdomain.com/terms"; // replace with real URL
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Unable to open link.");
    });
  };

  // Delete account (careful: requires recent login)
  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and data. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!user) {
              Alert.alert("Error", "No user signed in.");
              return;
            }
            try {
              setLoading(true);
              // Attempt to remove user's Firestore document (best-effort)
              const userDocRef = doc(db, "users", uid);
              const snap = await getDoc(userDocRef);
              if (snap.exists()) {
                // try deleting user doc (single doc). If you store subcollections, they must be deleted separately.
                await deleteDoc(userDocRef);
              }
              // Delete from auth (may require recent login)
              await deleteUser(user);
              Alert.alert("Account deleted", "Your account has been deleted.");
              // Navigate to Login screen (app should handle auth state)
              navigation.replace("Login");
            } catch (err) {
              console.warn("deleteAccount:", err);
              Alert.alert(
                "Error",
                err.code === "auth/requires-recent-login"
                  ? "Please re-login first then try again."
                  : err.message || "Unable to delete account."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Sign out other devices (dummy implementation)
  // If you store login tokens in Firestore, you can remove them here.
  const handleSignOutOtherDevices = async () => {
    if (!uid) return;
    try {
      setLoading(true);
      // Example: clear a "sessions" subcollection or set a flag to invalidate tokens.
      // This is highly app-specific. Here we simply add a "lastSignOutAll" timestamp to user's doc
      const userDocRef = doc(db, "users", uid);
      await setDoc(userDocRef, { lastSignOutAll: Date.now() }, { merge: true });
      Alert.alert("Success", "Signed out on other devices (if supported).");
      fetchLoginActivity();
    } catch (err) {
      console.warn("signOutOtherDevices:", err);
      Alert.alert("Error", "Unable to sign out other devices.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        <Text style={styles.header}>Privacy & Security</Text>

        {/* Change Password */}
        <Text style={styles.section}>Account Security</Text>
        <Option
          icon="key-outline"
          label="Change Password"
          onPress={() => setShowChangePassword((s) => !s)}
        />

        {showChangePassword && (
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Current password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="New password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#2563eb" }]}
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Update Password</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#e5e7eb" }]}
                onPress={() => setShowChangePassword(false)}
                disabled={loading}
              >
                <Text style={[styles.btnText, { color: "#111" }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

       <Option
  icon="finger-print-outline"
  label="Two-step Verification"
  onPress={() => navigation.navigate("TwoFactor")}
/>


        {/* Login activity */}
        <Text style={styles.section}>Login Activity</Text>

        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator />
          ) : loginActivity.length === 0 ? (
            <Text style={styles.muted}>No recent login activity found.</Text>
          ) : (
            loginActivity.map((it) => (
              <View key={it.id} style={styles.activityRow}>
                <View>
                  <Text style={styles.activityTitle}>
                    {it.deviceName || it.platform || "Unknown device"}
                  </Text>
                  <Text style={styles.muted}>
                    {it.ip || it.location || ""}
                    {it.time ? ` · ${new Date(it.time).toLocaleString()}` : ""}
                  </Text>
                </View>
              </View>
            ))
          )}

          <TouchableOpacity
            style={[styles.btn, { marginTop: 12 }]}
            onPress={handleSignOutOtherDevices}
          >
            <Text style={styles.btnText}>Sign out from other devices</Text>
          </TouchableOpacity>
        </View>

        {/* App Permissions */}
        <Text style={styles.section}>Permissions</Text>
        <Option
          icon="construct-outline"
          label="App Permissions"
          onPress={openAppSettings}
        />

        {/* Policies */}
        <Text style={styles.section}>Policies</Text>
        <Option icon="document-text-outline" label="Privacy Policy" onPress={openPrivacyPolicy} />
        <Option icon="reader-outline" label="Terms & Conditions" onPress={openTerms} />

        {/* Account deletion */}
        <Text style={styles.section}>Danger Zone</Text>
        <View style={styles.card}>
          <Text style={{ color: "#b91c1c", fontWeight: "800", marginBottom: 10 }}>
            Delete your account
          </Text>
          <Text style={styles.muted}>
            Deleting will remove your account and most data. This action is irreversible.
          </Text>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#b91c1c", marginTop: 12 }]}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.btnText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* Small option row */
function Option({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.option} onPress={onPress}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name={icon} size={20} color="#2563eb" />
        <Text style={[styles.optionLabel, { marginLeft: 12 }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#999" />
    </TouchableOpacity>
  );
}

/* Styles */
const styles = StyleSheet.create({
  header: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },
  section: {
    marginTop: 18,
    fontSize: 15,
    fontWeight: "800",
    color: "#374151",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    elevation: 1,
    marginBottom: 8,
  },
  option: {
    backgroundColor: "#fff",
    padding: 14,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  btn: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
  },
  btnText: {
    color: "#fff",
    fontWeight: "800",
  },
  muted: {
    color: "#6b7280",
  },
  activityRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
});
