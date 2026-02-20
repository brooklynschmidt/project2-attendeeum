import express from "express";
import authRoutes from "./routes/auth.js";
import eventsRoutes from "./routes/events.js";

console.log("Hello");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("frontend"));

app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});