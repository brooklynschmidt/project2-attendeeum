// used to update user profiles
import { MongoClient } from "mongodb";

export default function myMongoDB() {
    const me = {};
    const URI = process.env.MONGODB_URI || "mongodb://admin:devpass123@localhost:27017/?authSource=admin";
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
                        description: description || ""
                    }
                }
            );
            return result;
        } finally {
            await client.close();
        }
    };

    return me;
}