// screens/WebPayment.js

import React from "react";
import { WebView } from "react-native-webview";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⭐ FIREBASE
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function WebPayment({ route, navigation }) {
  const { amount, orderId, keyId, delivery, billing, items, uid } = route.params;

  const html = `
    <html>
      <body onload="payNow()">
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
          function payNow() {
            var options = {
              key: "${keyId}",
              amount: ${amount * 100},
              currency: "INR",
              name: "SfyKart",
              description: "Order Payment",
              order_id: "${orderId}",

              handler: function (response){
                window.ReactNativeWebView.postMessage(
                  JSON.stringify({
                    status: "success",
                    paymentId: response.razorpay_payment_id
                  })
                );
              },

              // ⭐ Popup disable – GO BACK/RETRY popup remove
              readonly: true,

              prefill: {
                email: "customer@example.com",
                contact: "${delivery?.phone || ""}"
              },

              theme: { color: "#2563eb" }
            };

            var rzp = new Razorpay(options);
            rzp.open();
          }
        </script>
      </body>
    </html>
  `;

  // 🔥 PAYMENT MESSAGE RECEIVED
  const handlePayment = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.status === "success") {
        await saveOnlineOrder(data.paymentId);
      }
    } catch (e) {
      console.log("Payment parse error:", e);
    }
  };

  // ⭐ SAVE ONLINE ORDER + REDIRECT
  const saveOnlineOrder = async (paymentId) => {
    try {
      const newOrderId = "ORD" + Date.now();

      await setDoc(doc(db, "orders", newOrderId), {
        orderId: newOrderId,
        userId: uid,
        items: items,
        billingAddress: billing,
        deliveryAddress: delivery,
        paymentStatus: "PAID",
        paymentId: paymentId,
        totalAmount: amount,
        status: "Confirmed",
        createdAt: Timestamp.fromDate(new Date()),
        expectedDelivery: null,
      });

      // Clear Cart
      await AsyncStorage.removeItem("sfy_cart_v1");

      // ⭐ Direct ThankYou page
      navigation.replace("ThankYou", {
        orderId: newOrderId,
        amount: amount,
      });

    } catch (e) {
      Alert.alert("Error", "Order save failed: " + e.message);
    }
  };

  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html }}
      onMessage={handlePayment}
    />
  );
}
