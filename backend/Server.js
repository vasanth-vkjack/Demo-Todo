const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 4000;

require("dotenv").config();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://todoapp-frontend-p41b.onrender.com",
    credentials: true,
  })
);
// origin: "http://localhost:3000",
// origin: "https://resplendent-beignet-2fdf22.netlify.app/",

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to Mongodb..."))
  .catch((err) => console.log(err));

// login siginup

const Users = require("./models/Users");

app.post("/signup", async (req, res) => {
  const existingUser = await Users.findOne({ email: req.body.email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      errors: "User already exists with this email",
    });
  }

  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });

  await user.save();

  const data = { user: { id: user.id } };
  console.log(data);
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  console.log(token);
  res.cookie("Token", token, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    maxAge: 60 * 60 * 1000,
  });

  res.json({ success: true, data, token });
});

app.post("/login", async (req, res) => {
  const user = await Users.findOne({ email: req.body.email });

  if (!user) {
    return res.json({ success: false, errors: "Invalid Email" });
  }

  const isPasswordValid = req.body.password === user.password;
  if (!isPasswordValid) {
    return res.json({ success: false, errors: "Invalid Password" });
  }

  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  console.log(token);
  res.cookie("Token", token, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    maxAge: 60 * 60 * 1000,
  });

  res.json({ success: true, message: "Logged in successfully" });
});

app.get("/profile", (req, res) => { 
  const token = req.cookies.Token;
  if (!token)
    return res.status(401).json({ success: false, error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    res.json({ success: true, email: decoded.email });
  } catch (err) {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("Token");
  res.json({ success: true, message: "Logged out" });
});

const ToDoModel = require("./models/ToDoModel");

const authenticateUser = async (req, res, next) => {
  const token = req.cookies.Token;
  // console.log("token", token);

  if (!token)
    return res.status(401).json({ success: false, error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("result", decoded);
    req.email = decoded.email;
    next();
  } catch (err) {
    res.status(400).json({ success: false, error: "Invalid token" });
  }
};

app.get("/todos", authenticateUser, async (req, res) => {
  const user = await Users.findOne({ email: req?.email });
  console.log("user", user);
  const toDo = await ToDoModel.find({ userId: user?._id });
  res.send(toDo);
});

app.post("/save", authenticateUser, async (req, res) => {
  const user = await Users.findOne({ email: req.email });
  const { text, description, status } = req.body;
  console.log("user", user);
  ToDoModel.create({ text, description, status, userId: user?._id }).then(
    (data) => {
      console.log("Added Successfully...");
      res.send(data);
    }
  );
});

app.put("/update/:id", async (req, res) => {
  const { text, description, status } = req.body;
  const { id } = req.params;
  console.log(text, description, status, id);
  try {
    const updatedTodo = await ToDoModel.findByIdAndUpdate(
      id,
      { text, description, status },
      { new: true }
    );
    res.json(updatedTodo); // send updated todo item back
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  ToDoModel.findByIdAndDelete(id)
    .then(() => res.send("Deleted Sucessfully..."))
    .catch((err) => console.log(err));
});

app.listen(PORT, () => {
  console.log(`Running on port: ${PORT}`);
});
