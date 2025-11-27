// App.js

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// 🔥 Push Notifications
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useEffect, useState } from "react";

// Firebase
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./src/firebaseConfig";

// Auth Screens
import LoginScreen from "./src/screens/LoginScreen";
import OTPVerify from "./src/screens/OTPVerify";
import EmailLogin from "./src/screens/EmailLogin";
import GoogleLogin from "./src/screens/GoogleLogin";
import TwoFactor from "./src/screens/TwoFactor";

// ⭐ MAIN TABS
import AppTabs from "./src/navigation/AppTabs";

// Main Product Screens
import ProductDetails from "./src/screens/ProductDetails";
import CheckoutScreen from "./src/screens/CheckoutScreen";
import PaymentScreen from "./src/screens/PaymentScreen";
import WebPayment from "./src/screens/WebPayment";
import ThankYou from "./src/screens/ThankYou";

// Profile Screens
import ProfileSettings from "./src/screens/ProfileSettings";
import EditAddress from "./src/screens/EditAddress";
import CreateAccount from "./src/screens/CreateAccount";
import PrivacySecurity from "./src/screens/PrivacySecurity";
import NotificationsScreen from "./src/screens/Notifications"; // renamed to avoid conflict

// Orders
import Orders from "./src/screens/Orders";
import OrderDetails from "./src/screens/OrderDetails";
import RefundStatus from "./src/screens/RefundStatus";

// Help
import Help from "./src/screens/Help";

const Stack = createNativeStackNavigator();

// ---------------------------------
// 🔥 PUSH NOTIFICATION SETTINGS
// ---------------------------------

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [expoToken, setExpoToken] = useState("");

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  // 🔥 ASK PERMISSION + GET PUSH TOKEN
  async function registerForPushNotifications() {
    try {
      if (Device.isDevice) {
        let { status } = await Notifications.getPermissionsAsync();
        if (status !== "granted") {
          const { status: newStatus } =
            await Notifications.requestPermissionsAsync();
          status = newStatus;
        }

        if (status !== "granted") {
          console.log("Permission not granted for notifications");
          return;
        }

        const token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log("Expo Token:", token);

        setExpoToken(token);
        saveTokenToUser(token);
      }
    } catch (error) {
      console.log("Push Notification Error:", error);
    }
  }

  // 🔥 SAVE TOKEN TO FIRESTORE
  async function saveTokenToUser(token) {
    const user = auth.currentUser;
    if (!user) return;

    await setDoc(
      doc(db, "users", user.uid),
      { expoToken: token },
      { merge: true }
    );
  }

  // ---------------------------------

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          presentation: "transparentModal", // ⭐ tab bar safe
        }}
      >
        {/* ⭐ START APP WITH TABS */}
        <Stack.Screen name="Tabs" component={AppTabs} />

        {/* AUTH SCREENS */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OTPVerify" component={OTPVerify} />
        <Stack.Screen name="EmailLogin" component={EmailLogin} />
        <Stack.Screen name="GoogleLogin" component={GoogleLogin} />
        <Stack.Screen name="TwoFactor" component={TwoFactor} />

        {/* PRODUCT SCREENS */}
        <Stack.Screen name="ProductDetails" component={ProductDetails} />
        <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
        <Stack.Screen name="WebPayment" component={WebPayment} />
        <Stack.Screen name="ThankYou" component={ThankYou} />

        {/* PROFILE */}
        <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
        <Stack.Screen name="EditAddress" component={EditAddress} />
        <Stack.Screen name="CreateAccount" component={CreateAccount} />
        <Stack.Screen name="PrivacySecurity" component={PrivacySecurity} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />

        {/* ORDERS */}
        <Stack.Screen name="Orders" component={Orders} />
        <Stack.Screen name="OrderDetails" component={OrderDetails} />
        <Stack.Screen name="RefundStatus" component={RefundStatus} />

        {/* HELP */}
        <Stack.Screen name="Help" component={Help} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
