// hooks/useUser.js
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (current) => {
      try {
        setLoading(true);

        if (!current) {
          setUser(null);
          await AsyncStorage.removeItem("sfy_user_v1");
          setLoading(false);
          return;
        }

        const uid = current.uid;
        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          const finalUser = { ...data, uid };
          await AsyncStorage.setItem(
            "sfy_user_v1",
            JSON.stringify(finalUser)
          );
          setUser(finalUser);
        } else {
          const minimalUser = {
            uid,
            mobile: current.phoneNumber?.replace("+91", "") || "",
          };
          await AsyncStorage.setItem(
            "sfy_user_v1",
            JSON.stringify(minimalUser)
          );
          setUser(minimalUser);
        }
      } catch (e) {
        console.log("useUser error:", e);
      } finally {
        setLoading(false);
      }
    });

    return unsub;
  }, []);

  return { user, loading };
}
