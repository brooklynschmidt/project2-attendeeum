import { MongoClient, ObjectId } from "mongodb";

export default function myMongoDB() {
    const me = {};
    const URI = process.env.MONGODB_URI || "mongodb://admin:devpass123@localhost:27017/?authSource=admin";
    const DB_NAME = "registrationdb";

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

    // ================================
    // RSVP: upsert a user's RSVP status on an event
    // attending array entries: { email, name, status }
    // status: "going" | "maybe" | "not_going"
    // ================================
    me.rsvpEvent = async (eventId, email, name, status) => {
        const { client, events } = await connect();
        try {
            // Remove any existing RSVP from this user first
            await events.updateOne(
                { _id: new ObjectId(eventId) },
                { $pull: { attending: { email } } }
            );

            // If "not_going", we just remove — don't add back
            if (status === "not_going") {
                const updated = await events.findOne({ _id: new ObjectId(eventId) });
                return { success: true, attending: updated.attending };
            }

            // Push the new RSVP
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

    // ================================
    // Get events for "My Calendar" view
    // Returns events created by the user OR by users who shared with them
    // ================================
    me.getMyCalendarEvents = async (emails) => {
        const { client, events } = await connect();
        try {
            return await events.find({ createdBy: { $in: emails } }).toArray();
        } finally {
            await client.close();
        }
    };

    return me;
}