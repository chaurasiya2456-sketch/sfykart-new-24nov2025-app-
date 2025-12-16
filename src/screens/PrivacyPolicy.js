// src/screens/PrivacyPolicy.js

import React from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicy() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Title */}
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.sub}>Last Updated: 06 December 2025</Text>

        {/* Intro */}
        <Text style={styles.text}>
          SfyKart Pvt Ltd (“Company”, “we”, “our”, “us”) operates the SfyKart mobile application
          and services. This Privacy Policy explains how we collect, use, and protect your
          personal information when you use SfyKart.
        </Text>

        {/* Section 1 */}
        <Text style={styles.heading}>1. Information We Collect</Text>

        <Text style={styles.bulletTitle}>Personal Information:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• Name</Text>
          <Text style={styles.bullet}>• Phone number</Text>
          <Text style={styles.bullet}>• Email address</Text>
          <Text style={styles.bullet}>• Delivery address</Text>
          <Text style={styles.bullet}>• PIN code, City, State</Text>
          <Text style={styles.bullet}>• Payment method (UPI/Wallet/Card)</Text>
        </View>

        <Text style={styles.bulletTitle}>Order Information:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• Products purchased</Text>
          <Text style={styles.bullet}>• Order ID, payment ID</Text>
          <Text style={styles.bullet}>• Refund/return requests</Text>
        </View>

        <Text style={styles.bulletTitle}>Device & Usage Data:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• Device model</Text>
          <Text style={styles.bullet}>• App events & activity</Text>
          <Text style={styles.bullet}>• IP address</Text>
          <Text style={styles.bullet}>• Analytics data</Text>
        </View>

        {/* Section 2 */}
        <Text style={styles.heading}>2. How We Use Your Data</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• Create and manage your account</Text>
          <Text style={styles.bullet}>• Process orders and payments</Text>
          <Text style={styles.bullet}>• Deliver products</Text>
          <Text style={styles.bullet}>• Send OTP and alerts</Text>
          <Text style={styles.bullet}>• Improve app performance</Text>
          <Text style={styles.bullet}>• Prevent fraud</Text>
        </View>

        {/* Section 3 */}
        <Text style={styles.heading}>3. Sharing Your Information</Text>
        <Text style={styles.text}>
          We may share your information with:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• Delivery partners</Text>
          <Text style={styles.bullet}>• Payment gateways</Text>
          <Text style={styles.bullet}>• Analytics & crash reporting</Text>
        </View>
        <Text style={styles.text}>
          We do not sell your personal information.
        </Text>

        {/* Section 4 */}
        <Text style={styles.heading}>4. Data Security</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• Encrypted storage</Text>
          <Text style={styles.bullet}>• Secure servers</Text>
          <Text style={styles.bullet}>• HTTPS protection</Text>
        </View>

        {/* Section 5 */}
        <Text style={styles.heading}>5. Your Rights</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• Update your account details</Text>
          <Text style={styles.bullet}>• Request account deletion</Text>
          <Text style={styles.bullet}>• Opt-out of marketing</Text>
        </View>

        {/* Section 6 */}
        <Text style={styles.heading}>6. Changes to Policy</Text>
        <Text style={styles.text}>
          We may update this Privacy Policy occasionally. Latest date will be shown at the top.
        </Text>

        {/* Section 7 */}
        <Text style={styles.heading}>7. Contact Support</Text>
        <Text style={styles.text}>
          Email: support@sfykart.com{"\n"}
          Mobile: +91-8736922212{"\n"}
          Vill – Malho, Post – Tarya Sujan,{"\n"}
          Dist – Kushinagar, Uttar Pradesh – 274409, India.
        </Text>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 16,
    paddingBottom: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#2563eb", // SfyKart Blue
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    color: "#777",
    marginBottom: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 8,
    color: "#111",
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    color: "#444",
  },
  bulletTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 4,
    color: "#222",
  },
  bulletList: {
    paddingLeft: 6,
    marginBottom: 6,
  },
  bullet: {
    fontSize: 15,
    marginBottom: 4,
    color: "#444",
  },
});
