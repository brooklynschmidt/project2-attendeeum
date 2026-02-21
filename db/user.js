// used to update user profiles
import { MongoClient } from "mongodb";

export default function myMongoDB() {
  const me = {};
  const URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const DB_NAME = "registrationdb";

  const connect = async () => {
    const client = new MongoClient(URI);
    await client.connect();
    const users = client.db(DB_NAME).collection("login-info");
    return { client, users };
  };

  me.updateProfile = async (email, organization, description) => {
    const { client, users } = await connect();
    try {
      const result = await users.updateOne(
        { email },
        {
          $set: {
            organization: organization || "",
            description: description || "",
          },
        },
      );
      return result;
    } finally {
      await client.close();
    }
  };

  // ================================
  // Share calendar with another user
  // Adds targetEmail to the owner's sharedWith array
  // ================================
  me.shareCalendar = async (ownerEmail, targetEmail) => {
    const { client, users } = await connect();
    try {
      // Check that target user exists
      const targetUser = await users.findOne({ email: targetEmail });
      if (!targetUser) {
        return { success: false, reason: "user_not_found" };
      }

      // Can't share with yourself
      if (ownerEmail === targetEmail) {
        return { success: false, reason: "cannot_share_self" };
      }

      // Add to sharedWith array (no duplicates)
      await users.updateOne(
        { email: ownerEmail },
        { $addToSet: { sharedWith: targetEmail } },
      );

      return { success: true };
    } finally {
      await client.close();
    }
  };

  // ================================
  // Get list of users who have shared their calendar WITH me
  // (i.e. other users whose sharedWith array contains my email)
  // ================================
  me.getSharedWithMe = async (email) => {
    const { client, users } = await connect();
    try {
      const sharers = await users
        .find(
          { sharedWith: email },
          { projection: { email: 1, name: 1, _id: 0 } },
        )
        .toArray();

      return sharers;
    } finally {
      await client.close();
    }
  };

  // ================================
  // Get list of users I have shared my calendar with
  // ================================
  me.getMySharedList = async (email) => {
    const { client, users } = await connect();
    try {
      const user = await users.findOne(
        { email },
        { projection: { sharedWith: 1, _id: 0 } },
      );

      return user?.sharedWith || [];
    } finally {
      await client.close();
    }
  };

  // ================================
  // Remove a share (unshare your calendar from someone)
  // ================================
  me.unshareCalendar = async (ownerEmail, targetEmail) => {
    const { client, users } = await connect();
    try {
      await users.updateOne(
        { email: ownerEmail },
        { $pull: { sharedWith: targetEmail } },
      );
      return { success: true };
    } finally {
      await client.close();
    }
  };

  return me;
}
