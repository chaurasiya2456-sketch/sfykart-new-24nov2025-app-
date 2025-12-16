// src/screens/Terms.js

import React from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Terms() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>Terms & Conditions</Text>
        <Text style={styles.sub}>Last Updated: 06 December 2025</Text>

        {/* Intro */}
        <Text style={styles.text}>
          These Terms & Conditions (“Terms”) govern your access and use of the
          SfyKart mobile application and services operated by SfyKart Pvt Ltd.
          By using SfyKart, you agree to be bound by these Terms.
        </Text>

        {/* Section 1 */}
        <Text style={styles.heading}>1. Eligibility</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• You are at least 13 years old.</Text>
          <Text style={styles.bullet}>
            • You provide a valid mobile number and delivery address.
          </Text>
          <Text style={styles.bullet}>
            • You use the app only for lawful purchases.
          </Text>
        </View>

        {/* Section 2 */}
        <Text style={styles.heading}>2. Account Registration</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>
            • You must provide accurate and complete information while
              registering or updating your account.
          </Text>
          <Text style={styles.bullet}>
            • You are responsible for maintaining the confidentiality of OTPs
              and account activity done using your account.
          </Text>
          <Text style={styles.bullet}>
            • You agree to inform us immediately in case of any unauthorized use
              or security breach.
          </Text>
          <Text style={styles.bullet}>
            • SfyKart reserves the right to suspend or terminate accounts
              suspected of fraud, misuse, or violation of these Terms.
          </Text>
        </View>

        {/* Section 3 */}
        <Text style={styles.heading}>3. Orders & Pricing</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>
            • All products, prices, offers and availability displayed in the app
              are subject to change without prior notice.
          </Text>
          <Text style={styles.bullet}>
            • An order is considered confirmed only after we verify the order
              details and dispatch the product.
          </Text>
          <Text style={styles.bullet}>
            • In case of any pricing error, typo or technical issue, we reserve
              the right to cancel the order and refund the amount (if paid).
          </Text>
          <Text style={styles.bullet}>
            • Taxes, delivery charges or convenience fees (if any) will be shown
              at checkout.
          </Text>
        </View>

        {/* Section 4 */}
        <Text style={styles.heading}>4. Payments</Text>
        <Text style={styles.text}>
          We use secure payment gateways for processing payments. You agree to
          use valid and authorized payment methods only.
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• UPI (PhonePe, GPay, Paytm, etc.)</Text>
          <Text style={styles.bullet}>• Debit / Credit Cards</Text>
          <Text style={styles.bullet}>• Netbanking</Text>
          <Text style={styles.bullet}>• Wallets</Text>
          <Text style={styles.bullet}>• Cash on Delivery (where available)</Text>
        </View>
        <Text style={styles.text}>
          In case of payment failure, the order may not be confirmed. Refunds
          for failed or reversed payments are processed as per bank and gateway
          timelines.
        </Text>

        {/* Section 5 */}
        <Text style={styles.heading}>5. Shipping & Delivery</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>
            • Estimated delivery time is shown at checkout and may vary based on
              location and courier partner.
          </Text>
          <Text style={styles.bullet}>
            • Delays may occur due to holidays, strikes, weather conditions or
              other reasons beyond our control.
          </Text>
          <Text style={styles.bullet}>
            • Risk of loss passes to you once the product is delivered to your
              address.
          </Text>
          <Text style={styles.bullet}>
            • It is your responsibility to provide a correct and complete
              shipping address.
          </Text>
        </View>

        {/* Section 6 */}
        <Text style={styles.heading}>6. Returns & Refunds</Text>
        <Text style={styles.text}>
          Returns, replacements and refunds are governed by our{" "}
          <Text style={{ fontWeight: "700" }}>Refund & Return Policy</Text>.
          You should review the policy before placing an order.
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>
            • Eligible products can be returned within the specified return
              window mentioned in the Refund & Return Policy.
          </Text>
          <Text style={styles.bullet}>
            • Refunds are initiated after quality check and verification of the
              returned product.
          </Text>
          <Text style={styles.bullet}>
            • Some products may be non-returnable due to hygiene, safety or
              other reasons (e.g., innerwear, personal care, etc.).
          </Text>
        </View>

        {/* Section 7 */}
        <Text style={styles.heading}>7. Prohibited Use</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• Using fake or misleading information.</Text>
          <Text style={styles.bullet}>• Abusing Cash on Delivery (COD).</Text>
          <Text style={styles.bullet}>
            • Attempting fraud, chargebacks or unauthorized transactions.
          </Text>
          <Text style={styles.bullet}>
            • Interfering with the security or performance of the app.
          </Text>
          <Text style={styles.bullet}>
            • Copying, modifying or reverse-engineering the app.
          </Text>
        </View>

        {/* Section 8 */}
        <Text style={styles.heading}>8. Intellectual Property</Text>
        <Text style={styles.text}>
          All content and materials available on SfyKart, including logos,
          designs, text, graphics, product images, icons and software, are owned
          by or licensed to SfyKart Pvt Ltd. You may not copy, reproduce, modify,
          distribute or use any content without prior written permission.
        </Text>

        {/* Section 9 */}
        <Text style={styles.heading}>9. Limitation of Liability</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>
            • We are not responsible for any indirect, incidental or
              consequential damages arising from the use of the app.
          </Text>
          <Text style={styles.bullet}>
            • Our total liability for any claim relating to an order will not
              exceed the value of that specific order.
          </Text>
          <Text style={styles.bullet}>
            • We are not liable for delays, failures or losses caused by events
              beyond our reasonable control.
          </Text>
        </View>

        {/* Section 10 */}
        <Text style={styles.heading}>10. Changes to These Terms</Text>
        <Text style={styles.text}>
          We may update or modify these Terms from time to time. Updated Terms
          will be made available within the app. Continued use of SfyKart after
          such updates means you accept the revised Terms.
        </Text>

        {/* Section 11 */}
        <Text style={styles.heading}>11. Contact Information</Text>
        <Text style={styles.text}>
          If you have any questions or concerns about these Terms, please
          contact:
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
