const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

mongoose.connect("mongodb://127.0.0.1:27017/smart-service", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { fullName, email, password, contact, location, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      contact,
      location,
      role,
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Set cookie
    res.cookie("user", JSON.stringify({ id: user._id, role: user.role }), {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    res.json({ message: "Login successful", role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Protected route example
app.get("/api/dashboard", (req, res) => {
  const userCookie = req.cookies.user;
  if (!userCookie) return res.status(401).json({ message: "Unauthorized" });

  const user = JSON.parse(userCookie);
  res.json({ message: `Welcome ${user.role} to your dashboard` });
});

app.listen(5000, () => console.log("Server running on port 5000"));
