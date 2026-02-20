import express from "express";
import myMongoDB from "../db/user.js";

const router = express.Router();
const db = myMongoDB();

router.put("/", async (req, res) => {
  const { email, organization, description } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const result = await db.updateProfile(email, organization, description);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating profile:", err);
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;