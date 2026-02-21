import express from "express";
import myMongoDB from "../db/registration.js";

const router = express.Router();
const db = myMongoDB();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const loginUser = await db.getLogin({
      email: email,
      password: password,
    });

    if (loginUser === null) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Use getUser here
    const user = await db.getUser({ email: email });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const organization = "";
  const description = "";

  try {
    const emailTaken = await db.isEmailTaken(email);
    if (emailTaken) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = {
      name,
      email,
      password,
      organization,
      description,
    };

    const userId = await db.createUser(user);

    return res.status(201).json({
      message: "Signup successful",
      user: {
        id: userId,
        name,
        email,
        organization,
        description,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error during signup",
    });
  }
});

export default router;
