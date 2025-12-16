// App.js

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Firebase
import { auth } from "./src/firebaseConfig";

// AUTH SCREENS
import LoginScreen from "./src/screens/LoginScreen";
import OTPVerify from "./src/screens/OTPVerify";
import EmailLogin from "./src/screens/EmailLogin";
import GoogleLogin from "./src/screens/GoogleLogin";
import TwoFactor from "./src/screens/TwoFactor";

// MAIN TAB NAVIGATION
import AppTabs from "./src/navigation/AppTabs";

// PRODUCT SCREENS
import ProductDetails from "./src/screens/ProductDetails";
import CheckoutScreen from "./src/screens/CheckoutScreen";
import PaymentScreen from "./src/screens/PaymentScreen";
import WebPayment from "./src/screens/WebPayment";
import ThankYou from "./src/screens/ThankYou";

// PROFILE
import ProfileSettings from "./src/screens/ProfileSettings";
import EditAddress from "./src/screens/EditAddress";
import CreateAccount from "./src/screens/CreateAccount";
import PrivacySecurity from "./src/screens/PrivacySecurity";
import NotificationsScreen from "./src/screens/Notifications";

// LEGAL SCREENS (NEW)
import PrivacyPolicy from "./src/screens/PrivacyPolicy";
import Terms from "./src/screens/Terms";
import RefundPolicy from "./src/screens/RefundPolicy";

// ORDERS
import Orders from "./src/screens/Orders";
import OrderDetails from "./src/screens/OrderDetails";
import RefundStatus from "./src/screens/RefundStatus";

// HELP
import Help from "./src/screens/Help";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {/* 🔥 Start App on Tabs */}
        <Stack.Screen name="Tabs" component={AppTabs} />

        {/* AUTH SCREENS */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OTPVerify" component={OTPVerify} />
        <Stack.Screen name="EmailLogin" component={EmailLogin} />
        <Stack.Screen name="GoogleLogin" component={GoogleLogin} />
        <Stack.Screen name="TwoFactor" component={TwoFactor} />

        {/* PRODUCT FLOW */}
        <Stack.Screen name="ProductDetails" component={ProductDetails} />
        <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
        <Stack.Screen name="WebPayment" component={WebPayment} />
        <Stack.Screen name="ThankYou" component={ThankYou} />

        {/* PROFILE FLOW */}
        <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
        <Stack.Screen name="EditAddress" component={EditAddress} />
        <Stack.Screen name="CreateAccount" component={CreateAccount} />
        <Stack.Screen name="PrivacySecurity" component={PrivacySecurity} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />

        {/* LEGAL PAGES */}
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
        <Stack.Screen name="Terms" component={Terms} />
        <Stack.Screen name="RefundPolicy" component={RefundPolicy} />

        {/* ORDER FLOW */}
        <Stack.Screen name="Orders" component={Orders} />
        <Stack.Screen name="OrderDetails" component={OrderDetails} />
        <Stack.Screen name="RefundStatus" component={RefundStatus} />

        {/* HELP */}
        <Stack.Screen name="Help" component={Help} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
