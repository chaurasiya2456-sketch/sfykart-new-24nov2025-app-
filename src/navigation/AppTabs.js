// src/navigation/AppTabs.js

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

// MAIN SCREENS
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CartScreen from "../screens/CartScreen";

// AUTH SCREENS
import LoginScreen from "../screens/LoginScreen";
import GoogleLogin from "../screens/GoogleLogin";
import CreateAccount from "../screens/CreateAccount";

// ADDRESS & PROFILE
import Address from "../screens/Address";
import AddAddress from "../screens/AddAddress";
import EditAddress from "../screens/EditAddress";
import ProfileSettings from "../screens/ProfileSettings";
import Wallet from "../screens/Wallet";
import RefundStatus from "../screens/RefundStatus";
import Help from "../screens/Help";
import Notifications from "../screens/Notifications";
import PrivacySecurity from "../screens/PrivacySecurity";
import TwoFactor from "../screens/TwoFactor";

// PRODUCT & ORDER SCREENS
import ProductDetails from "../screens/ProductDetails";
import CheckoutScreen from "../screens/CheckoutScreen";
import PaymentScreen from "../screens/PaymentScreen";
import WebPayment from "../screens/WebPayment";
import ThankYou from "../screens/ThankYou";
import Orders from "../screens/Orders";
import OrderDetails from "../screens/OrderDetails";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/* ------------------------- HOME STACK ------------------------- */
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />

      {/* PRODUCT FLOW (TAB BAR VISIBLE) */}
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
      <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
      <Stack.Screen name="WebPayment" component={WebPayment} />
      <Stack.Screen name="ThankYou" component={ThankYou} />

      {/* AUTH FLOW */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="GoogleLogin" component={GoogleLogin} />
      <Stack.Screen name="CreateAccount" component={CreateAccount} />
    </Stack.Navigator>
  );
}

/* ------------------------- PROFILE STACK ------------------------- */
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />

      <Stack.Screen name="Address" component={Address} />
      <Stack.Screen name="AddAddress" component={AddAddress} />
      <Stack.Screen name="EditAddress" component={EditAddress} />

      <Stack.Screen name="Orders" component={Orders} />
      <Stack.Screen name="OrderDetails" component={OrderDetails} />

      <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
      <Stack.Screen name="Wallet" component={Wallet} />
      <Stack.Screen name="RefundStatus" component={RefundStatus} />
      <Stack.Screen name="Help" component={Help} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="PrivacySecurity" component={PrivacySecurity} />
      <Stack.Screen name="TwoFactor" component={TwoFactor} />

      {/* PRODUCT DETAILS FROM PROFILE AREA TOO */}
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
    </Stack.Navigator>
  );
}

/* ------------------------- MAIN TAB BAR ------------------------- */
export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: "600",
          marginBottom: 4,
        },
        tabBarStyle: {
          height: 60,
          backgroundColor: "#fff",
          borderTopWidth: 0,
          elevation: 5,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 6,
        },
        tabBarIcon: ({ focused }) => {
          let iconName = "home-outline";

          if (route.name === "Home") iconName = "home-outline";
          if (route.name === "Profile") iconName = "person-circle-outline";
          if (route.name === "Cart") iconName = "cart-outline";

          return (
            <Ionicons
              name={iconName}
              size={26}
              color={focused ? "#2563eb" : "#9ca3af"}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
      <Tab.Screen name="Cart" component={CartScreen} />
    </Tab.Navigator>
  );
}
