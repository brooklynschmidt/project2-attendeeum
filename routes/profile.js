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

// ================================
// Share your calendar with another user
// POST /api/profile/share
// Body: { ownerEmail, targetEmail }
// ================================
router.post("/share", async (req, res) => {
  const { ownerEmail, targetEmail } = req.body;

  if (!ownerEmail || !targetEmail) {
    return res.status(400).json({ message: "Both emails are required" });
  }

  try {
    const result = await db.shareCalendar(ownerEmail, targetEmail);

    if (!result.success) {
      if (result.reason === "user_not_found") {
        return res.status(404).json({ message: "User not found" });
      }
      if (result.reason === "cannot_share_self") {
        return res.status(400).json({ message: "Cannot share with yourself" });
      }
    }

    return res.json({ message: "Calendar shared successfully" });
  } catch (err) {
    console.error("Error sharing calendar:", err);
    return res.status(500).json({ message: "Failed to share calendar" });
  }
});

// ================================
// Unshare your calendar from a user
// POST /api/profile/unshare
// Body: { ownerEmail, targetEmail }
// ================================
router.post("/unshare", async (req, res) => {
  const { ownerEmail, targetEmail } = req.body;

  if (!ownerEmail || !targetEmail) {
    return res.status(400).json({ message: "Both emails are required" });
  }

  try {
    await db.unshareCalendar(ownerEmail, targetEmail);
    return res.json({ message: "Calendar unshared successfully" });
  } catch (err) {
    console.error("Error unsharing calendar:", err);
    return res.status(500).json({ message: "Failed to unshare calendar" });
  }
});

// ================================
// Get users who have shared their calendar with me
// GET /api/profile/shared-with-me?email=
// ================================
router.get("/shared-with-me", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const sharers = await db.getSharedWithMe(email);
    return res.json(sharers);
  } catch (err) {
    console.error("Error getting shared calendars:", err);
    return res.status(500).json({ message: "Failed to get shared calendars" });
  }
});

// ================================
// Get users I have shared my calendar with
// GET /api/profile/my-shares?email=
// ================================
router.get("/my-shares", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const sharedWith = await db.getMySharedList(email);
    return res.json(sharedWith);
  } catch (err) {
    console.error("Error getting share list:", err);
    return res.status(500).json({ message: "Failed to get share list" });
  }
});

export default router;
