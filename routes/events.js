import express from "express";
import myMongoDB from "../db/event.js";

const router = express.Router();
const db = myMongoDB();

// create new event
router.post("/", async (req, res) => {
    try {
        const event = req.body;
        const eventId = await db.createEvent(event);

        res.status(201).json({ id: eventId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create event" });
    }
});

router.get("/", async (req, res) => {
    try {
        const allEvents = await db.getAllEvents();
        res.json(allEvents);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch events" });
    }
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const userEmail = req.header("x-user-email");

    if (!userEmail) {
        return res.status(400).json({ message: "User email is required" });
    }

    try {
        const result = await db.deleteEventById(id, userEmail);

        if (!result.deleted) {
            if (result.reason === "not_found") return res.status(404).json({ message: "Event not found" });
            if (result.reason === "forbidden") return res.status(403).json({ message: "Forbidden" });
        }

        res.json({ message: "Event deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete event" });
    }
});
export default router;