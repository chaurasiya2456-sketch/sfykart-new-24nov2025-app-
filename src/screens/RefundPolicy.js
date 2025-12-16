// src/screens/RefundPolicy.js

import React from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RefundPolicy() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>Refund & Return Policy</Text>
        <Text style={styles.sub}>Last Updated: 06 December 2025</Text>

        {/* Intro */}
        <Text style={styles.text}>
          We want you to have a great shopping experience on SfyKart. If you
          face any issue with your order, this Refund & Return Policy explains
          how returns, replacements and refunds work on SfyKart.
        </Text>

        {/* Section 1 */}
        <Text style={styles.heading}>1. Return Window</Text>
        <Text style={styles.text}>
          You can request a return or replacement within:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• 7 days from the delivery date</Text>
        </View>
        <Text style={styles.text}>
          Return window may vary by product type. Please check product details.
        </Text>

        {/* Section 2 */}
        <Text style={styles.heading}>2. Eligible for Return</Text>
        <Text style={styles.text}>You can request return if:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• Wrong product delivered</Text>
          <Text style={styles.bullet}>• Item received in damaged condition</Text>
          <Text style={styles.bullet}>• Product is defective</Text>
          <Text style={styles.bullet}>• Missing parts or accessories</Text>
          <Text style={styles.bullet}>• Size/fitting issue (for wearables)</Text>
          <Text style={styles.bullet}>• Package tampered</Text>
        </View>

        {/* Section 3 */}
        <Text style={styles.heading}>3. Non-Returnable Products</Text>
        <Text style={styles.text}>
          For hygiene, safety and policy reasons, some items are not eligible:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• Innerwear and lingerie</Text>
          <Text style={styles.bullet}>• Socks and stockings</Text>
          <Text style={styles.bullet}>• Cosmetic and beauty products (opened)</Text>
          <Text style={styles.bullet}>• Personal hygiene items</Text>
          <Text style={styles.bullet}>• Food products and perishables</Text>
          <Text style={styles.bullet}>• Digital items/services</Text>
        </View>

        {/* Section 4 */}
        <Text style={styles.heading}>4. Refund Timeline</Text>
        <Text style={styles.text}>Refund will be processed to:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• Original payment source (for online payments)</Text>
          <Text style={styles.bullet}>• Bank transfer/UPI (for COD)</Text>
        </View>
        <Text style={styles.text}>
          Once product passes quality check:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• UPI/Card/Wallet: 3–7 working days</Text>
          <Text style={styles.bullet}>• Bank transfer: 3–7 working days</Text>
        </View>

        {/* Section 5 */}
        <Text style={styles.heading}>5. Replacement Process</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• Replacement will be provided for eligible products</Text>
          <Text style={styles.bullet}>• Subject to stock availability</Text>
          <Text style={styles.bullet}>• If product is not available → refund issued</Text>
        </View>

        {/* Section 6 */}
        <Text style={styles.heading}>6. Pickup Process</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• Pickup will be arranged from your address</Text>
          <Text style={styles.bullet}>• Product must be in original packing</Text>
          <Text style={styles.bullet}>• Include invoice and accessories</Text>
        </View>

        {/* Section 7 */}
        <Text style={styles.heading}>7. Quality Check</Text>
        <Text style={styles.text}>
          Refund is issued only after successful quality check by our return
          center:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• Condition of product</Text>
          <Text style={styles.bullet}>• Seal and packaging</Text>
          <Text style={styles.bullet}>• Accessories</Text>
        </View>
        <Text style={styles.text}>
          If QC fails, the product will be returned to you.
        </Text>

        {/* Section 8 */}
        <Text style={styles.heading}>8. Cancellation Policy</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• You can cancel before the order is packed</Text>
          <Text style={styles.bullet}>• If shipped, wait for delivery and request return</Text>
        </View>

        {/* Section 9 */}
        <Text style={styles.heading}>9. Contact Support</Text>
        <Text style={styles.text}>
          If you have questions or need help, contact:
          {"\n\n"}
          SfyKart Pvt Ltd{"\n"}
          Vill – Malho, Post – Tarya Sujan,{"\n"}
          Dist – Kushinagar, Uttar Pradesh – 274409, India{"\n"}
          Email: support@sfykart.com{"\n"}
          Mobile: +91-8736922212
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
