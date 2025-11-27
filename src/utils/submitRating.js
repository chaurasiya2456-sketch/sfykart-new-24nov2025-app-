// submitRating.js
import { db } from "../firebaseConfig";
import {
  doc,
  updateDoc,
  increment,
  getDoc,
  setDoc,
} from "firebase/firestore";

/**
 * ⭐ Submit rating to Firestore
 * @param {string} productId
 * @param {number} rating
 * @returns {Promise<void>}
 */
export const submitRating = async (productId, rating) => {
  if (!productId || !rating) return;

  try {
    const ref = doc(db, "products", productId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.log("❌ Product not found for rating:", productId);
      return;
    }

    const data = snap.data();

    // ---- DEFAULT FALLBACKS ----
    const totalReviews = data.totalReviews || 0;
    const avgRating = data.avgRating || 0;
    const ratingsCount = data.ratingsCount || {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
    };

    // ---- ADD NEW REVIEW ----
    const newTotalReviews = totalReviews + 1;

    const newRatingsCount = {
      ...ratingsCount,
      [rating]: (ratingsCount[rating] || 0) + 1,
    };

    // ---- RECALCULATE AVG RATING ----
    let totalStars =
      newRatingsCount[1] * 1 +
      newRatingsCount[2] * 2 +
      newRatingsCount[3] * 3 +
      newRatingsCount[4] * 4 +
      newRatingsCount[5] * 5;

    const newAvgRating = Number((totalStars / newTotalReviews).toFixed(1));

    // ---- UPDATE PRODUCT ----
    await updateDoc(ref, {
      totalReviews: newTotalReviews,
      avgRating: newAvgRating,
      ratingsCount: newRatingsCount,
    });

    console.log("⭐ Rating Updated Successfully");
  } catch (err) {
    console.log("Rating update error:", err);
  }
};
