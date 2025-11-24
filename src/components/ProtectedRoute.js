import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const navigation = useNavigation();

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 15 }}>
          Please Login to continue
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: "#2563eb",
            padding: 12,
            borderRadius: 10,
          }}
          onPress={() => navigation.navigate("LoginScreen")}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
            Login Now
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return children;
}
