// screens/Help.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function Help() {
  const email = "support@sfykart.com";
  const phone = "8736922212";

  const openEmail = async () => {
    const url = `mailto:${email}?subject=Support%20Request&body=Hello%20SfyKart%20Support,`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) Linking.openURL(url);
      else Alert.alert("Error", "No email app available.");
    } catch {
      Alert.alert("Error", "Unable to open email.");
    }
  };

  const callPhone = async () => {
    const url = Platform.OS === "android" ? `tel:${phone}` : `telprompt:${phone}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) Linking.openURL(url);
      else Alert.alert("Error", "Calling not supported.");
    } catch {
      Alert.alert("Error", "Unable to make a call.");
    }
  };

  const openWhatsApp = async () => {
    const phoneWithCountry = "91" + phone;
    const url = `https://wa.me/${phoneWithCountry}?text=Hello%20SfyKart%20Support`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) Linking.openURL(url);
      else Alert.alert("Error", "WhatsApp not installed.");
    } catch {
      Alert.alert("Error", "Unable to open WhatsApp.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Help & Support</Text>

        <View style={styles.card}>
          <Text style={styles.title}>Contact Us</Text>
          <Text style={styles.subtitle}>
            Need help? We're always here to support you.
          </Text>

          {/* EMAIL */}
          <TouchableOpacity style={styles.row} onPress={openEmail}>
            <View style={styles.iconBox}>
              <Ionicons name="mail-outline" size={22} color="#2563eb" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Email</Text>
              <Text style={styles.rowText}>{email}</Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          {/* PHONE */}
          <TouchableOpacity style={styles.row} onPress={callPhone}>
            <View style={styles.iconBox}>
              <Ionicons name="call-outline" size={22} color="#2563eb" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Phone</Text>
              <Text style={styles.rowText}>{phone}</Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          {/* WHATSAPP */}
          <TouchableOpacity style={styles.row} onPress={openWhatsApp}>
            <View style={[styles.iconBox, { backgroundColor: "#e7fbea" }]}>
              <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>WhatsApp</Text>
              <Text style={styles.rowText}>Chat with SfyKart Support</Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.hr} />

          {/* SUPPORT HOURS */}
          <Text style={styles.smallTitle}>Support Hours</Text>
          <Text style={styles.smallText}>Mon - Sat: 9:00 AM — 8:00 PM</Text>
          <Text style={styles.smallText}>Sun: 10:00 AM — 6:00 PM</Text>

          <View style={{ height: 10 }} />

          <Text style={styles.smallTitle}>Quick Help</Text>
          <Text style={styles.smallText}>
            For fast support, please include your Order ID with your message.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#2563eb" }]}
          onPress={openEmail}
        >
          <Text style={styles.btnText}>Email Support</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#10b981", marginTop: 12 }]}
          onPress={callPhone}
        >
          <Text style={styles.btnText}>Call Support</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#25D366", marginTop: 12 }]}
          onPress={openWhatsApp}
        >
          <Text style={styles.btnText}>Chat on WhatsApp</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },

  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  header: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111",
    marginBottom: 14,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },

  title: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  subtitle: { color: "#6b7280", fontSize: 14, marginBottom: 12 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },

  iconBox: {
    width: 45,
    height: 45,
    backgroundColor: "#eef2ff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  rowTitle: { fontSize: 15, fontWeight: "700" },
  rowText: { marginTop: 2, color: "#374151" },

  hr: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 14,
  },

  smallTitle: { fontWeight: "800", marginBottom: 6, color: "#374151" },
  smallText: { marginBottom: 4, color: "#6b7280" },

  btn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 1,
  },

  btnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
