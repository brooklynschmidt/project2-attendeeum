import express from "express";
import authRoutes from "./routes/auth.js";
import eventsRoutes from "./routes/events.js";
import profileRoutes from "./routes/profile.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("frontend"));
app.use("/images", express.static("images"));

app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/profile", profileRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
