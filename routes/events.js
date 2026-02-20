import express from "express";
import myMongoDB from "../db/event.js";
import myUserDB from "../db/user.js";

const router = express.Router();
const db = myMongoDB();
const userDb = myUserDB();

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

// ================================
// Get "My Calendar" events
// Returns events created by the user + events from users who shared with them
// GET /api/events/my-calendar?email=
// ================================
router.get("/my-calendar", async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        // Get users who have shared their calendar with me
        const sharers = await userDb.getSharedWithMe(email);
        const sharerEmails = sharers.map(s => s.email);

        // My events + shared users' events
        const allEmails = [email, ...sharerEmails];
        const events = await db.getMyCalendarEvents(allEmails);

        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch calendar events" });
    }
});

// ================================
// RSVP to an event
// PUT /api/events/:id/rsvp
// Body: { email, name, status }
// status: "going" | "maybe" | "not_going"
// ================================
router.put("/:id/rsvp", async (req, res) => {
    const { id } = req.params;
    const { email, name, status } = req.body;

    if (!email || !status) {
        return res.status(400).json({ message: "Email and status are required" });
    }

    const validStatuses = ["going", "maybe", "not_going"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid RSVP status" });
    }

    try {
        const result = await db.rsvpEvent(id, email, name || "Anonymous", status);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to RSVP" });
    }
});

export default router;