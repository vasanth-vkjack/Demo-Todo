const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 4000;
const multer = require("multer");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://todoapp9025.netlify.app/",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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
    sameSite: "none",
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
    sameSite: "none",
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
    console.log("reult", decoded);
    req.email = decoded.email;
    next();
  } catch (err) {
    res.status(400).json({ success: false, error: "Invalid token" });
  }
};

// Profile page route

app.get("/profileDetails", authenticateUser, async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.email }).select("-password");
    const todos = await ToDoModel.find({ userId: user._id });
    res.json({
      success: true,
      user,
      todoCount: todos.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to load profile" });
  }
});

// Multer storage setup

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "uploads");

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

app.use("/uploads", express.static("uploads"));

app.post(
  "/uploadProfilePic",
  authenticateUser,
  upload.single("profilePic"),
  async (req, res) => {
    const profileUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
    await Users.findOneAndUpdate(
      { email: req.email },
      { profilePic: profileUrl }
    );
    res.json({ success: true, profilePic: profileUrl });
  }
);

app.get("/todos", authenticateUser, async (req, res) => {
  // const user = await Users.findOne({ email: req?.email });
  // console.log("user", user);
  // const toDo = await ToDoModel.find({ userId: user?._id });
  // res.send(toDo);

  try {
    const user = await Users.findOne({ email: req?.email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    //Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    //Get todos with pagination
    const todos = await ToDoModel.find({ userId: user._id })
      .skip(skip)
      .limit(limit);

    const totalTodos = await ToDoModel.countDocuments({ userId: user._id });
    const totalPages = Math.ceil(totalTodos / limit);

    console.log(
      `Page ${page} - Showing ${todos.length} of ${totalTodos} todos`
    );
    console.log(totalPages, totalTodos);
    res.send({
      success: true,
      todos,
      pagination: {
        currentPage: page,
        totalPages,
        totalTodos,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).send({ message: "server error", error: error.message });
  }
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
