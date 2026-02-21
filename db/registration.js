// Used for getting user email + password
// Only for login page
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

    me.getLogin = async (query = {}) => {
        const { client, users } = await connect();
        try {
            return await users.findOne(query);
        } catch (err) {
            console.log("Error fetching listings from MongoDB", err);
        } finally {
            await client.close();
        }
    }

    me.isEmailTaken = async (email) => {
        const { client, users } = await connect();
        try {
            const existingUser = await users.findOne({ email });
            return !!existingUser;
        } catch (err) {
            console.log("Error checking email in MongoDB", err);
            return false;
        } finally {
            await client.close();
        }
    };

    me.createUser = async (user) => {
        const { client, users } = await connect();
        try {
            const result = await users.insertOne(user);
            return result.insertedId;
        } catch (err) {
            console.log("Error creating user in MongoDB", err);
            throw err;
        } finally {
            await client.close();
        }
    };

    me.getUser = async (query = {}) => {
        const { client, users } = await connect();
        try {
            const user = await users.findOne(
                query,
                {
                    projection: {
                        _id: 0,
                        name: 1,
                        email: 1,
                        password: 1,
                        organization: 1,
                        description: 1
                    }
                }
            );

            return user;
        } catch (err) {
            console.log("Error fetching user from MongoDB", err);
        } finally {
            await client.close();
        }
    };

    return me;
}
