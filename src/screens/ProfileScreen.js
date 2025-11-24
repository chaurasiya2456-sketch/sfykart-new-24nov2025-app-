import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import useUser from "../hooks/useUser";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const user = useUser();

  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace("Login");
  };

  return (
    <SafeAreaView style={styles.safe}>
<ScrollView
  style={styles.container}
  contentContainerStyle={{ paddingBottom: 100 }}
  showsVerticalScrollIndicator={false}
>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Your Account</Text>
        </View>

        {/* USER CARD */}
        <View style={styles.userCard}>
          <View style={styles.userLeft}>
            <Image
              source={{
                uri:
                  user?.photoURL ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
              style={styles.userImg}
            />

            <View>
  <Text style={styles.userName}>
    {user
      ? `Welcome ${user.firstName || "User"}`
      : "Welcome"}
  </Text>

  <Text style={styles.userPhoneEmail}>
    {user
      ? (user.mobile || user.email || "")
      : "Login to access account"}
  </Text>
</View>
</View>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => {
              user ? handleLogout() : navigation.navigate("Login");
            }}
          >
            <Text style={styles.loginBtnText}>
              {auth.currentUser ? "Logout" : "Login"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ORDERS & WALLET */}
        <Text style={styles.sectionTitle}>Your Orders & Wallet</Text>

        <Option
          icon="cube"
          label="Your Orders"
          onPress={() => navigation.navigate("Orders")}
        />

        <Option
          icon="wallet"
          label="Your Wallet"
          onPress={() => navigation.navigate("Wallet")}
        />

        <Option
  icon="cash"
  label="Refund Status"
  onPress={() => navigation.navigate("RefundStatus")}
/>



        {/* ACCOUNT SETTINGS */}
        <Text style={styles.sectionTitle}>Account Settings</Text>

        <Option
          icon="person-circle-outline"
          label="Edit Profile"
onPress={() => navigation.navigate("ProfileSettings", { uid: user?.uid })}
        />

        <Option
          icon="location-outline"
          label="Your Addresses"
          onPress={() => navigation.navigate("Address")}
        />

        <Option
   icon="notifications-outline"
   label="Notifications"
onPress={() => navigation.navigate("Notifications")}
/>

        <Option
  icon="shield-checkmark-outline"
  label="Privacy & Security"
  onPress={() => navigation.navigate("PrivacySecurity")}
/>


        {/* SUPPORT */}
        <Text style={styles.sectionTitle}>Support</Text>

       <Option
  icon="help-circle-outline"
  label="Help & Support"
  onPress={() => navigation.navigate("Help")}
/>


        {/* LOGOUT (only if user logged in) */}
        {user && (
          <TouchableOpacity style={styles.logoutBox} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#d00" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 50 }} />

      </ScrollView>
    </SafeAreaView>
  );
}

/* OPTION COMPONENT */
function Option({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.option} onPress={onPress}>
      <View style={styles.optionLeft}>
        <Ionicons name={icon} size={22} color="#2563eb" />
        <Text style={styles.optionLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },

  container: {
    flex: 1,
  },

  header: {
    backgroundColor: "#2563eb",
    paddingVertical: 18,
    paddingHorizontal: 15,
  },
  headerText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },

  userCard: {
    backgroundColor: "#fff",
    marginTop: 12,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 10,
    marginHorizontal: 12,
    alignItems: "center",
    elevation: 2,
  },

  userLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  userImg: {
    width: 55,
    height: 55,
    borderRadius: 30,
    marginRight: 12,
  },

  userName: {
    fontSize: 18,
    fontWeight: "800",
  },

  userPhoneEmail: {
    fontSize: 14,
    color: "#666",
  },

  loginBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  loginBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  sectionTitle: {
    marginTop: 22,
    marginLeft: 15,
    fontSize: 16,
    fontWeight: "800",
    color: "#555",
  },

  option: {
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
  },

  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  optionLabel: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "700",
  },

  logoutBox: {
    marginTop: 25,
    marginHorizontal: 12,
    backgroundColor: "#ffe5e5",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  logoutText: {
    marginLeft: 10,
    fontWeight: "800",
    fontSize: 16,
    color: "#d00",
  },
});
