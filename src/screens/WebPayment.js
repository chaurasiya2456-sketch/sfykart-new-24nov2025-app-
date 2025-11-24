import React from "react";
import { ActivityIndicator, View } from "react-native";
import WebView from "react-native-webview";

export default function WebPayment({ route, navigation }) {
  const paymentUrl = route.params?.url;

  return (
    <WebView
      source={{ uri: paymentUrl }}
      startInLoadingState
      renderLoading={() => (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      )}
      onNavigationStateChange={(state) => {
        const url = state.url || "";

        if (url.includes("success")) {
          alert("Payment Successful!");
          navigation.navigate("Orders");
        }

        if (url.includes("failed")) {
          alert("Payment Failed!");
          navigation.goBack();
        }
      }}
    />
  );
}
