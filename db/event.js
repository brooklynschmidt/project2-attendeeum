import { MongoClient, ObjectId } from "mongodb";

export default function myMongoDB() {
    const me = {};
    const URI = process.env.MONGODB_URI || "mongodb://admin:devpass123@localhost:27017/?authSource=admin";    const DB_NAME = "registrationdb";

    const connect = async () => {
        const client = new MongoClient(URI);
        await client.connect();
        const events = client.db(DB_NAME).collection("events");
        return { client, events };
    };

    me.connect = connect;

    me.createEvent = async (event) => {
        const { client, events } = await connect();
        try {
            const result = await events.insertOne(event);
            return result.insertedId;
        } finally {
            await client.close();
        }
    };

    me.getAllEvents = async () => {
        const { client, events } = await connect();
        try {
            return await events.find({}).toArray();
        } finally {
            await client.close();
        }
    };

    me.deleteEventById = async (id, userEmail) => {
        const { client, events } = await connect();
        try {
            const event = await events.findOne({ _id: new ObjectId(id) });
            if (!event) return { deleted: false, reason: "not_found" };
            if (event.createdBy !== userEmail) return { deleted: false, reason: "forbidden" };

            const result = await events.deleteOne({ _id: new ObjectId(id) });
            return { deleted: result.deletedCount === 1 };
        } finally {
            await client.close();
        }
    };

      me.rsvpEvent = async (eventId, email, name, status) => {
        const { client, events } = await connect();
        try {
            await events.updateOne(
                { _id: new ObjectId(eventId) },
                { $pull: { attending: { email } } }
            );

            if (status === "not_going") {
                const updated = await events.findOne({ _id: new ObjectId(eventId) });
                return { success: true, attending: updated.attending };
            }

            await events.updateOne(
                { _id: new ObjectId(eventId) },
                { $push: { attending: { email, name, status } } }
            );

            const updated = await events.findOne({ _id: new ObjectId(eventId) });
            return { success: true, attending: updated.attending };
        } finally {
            await client.close();
        }
    };


    return me;
}