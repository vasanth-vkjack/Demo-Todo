const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  todos: {
    ref: "Todo",
    type: mongoose.Schema.Types.ObjectId,
  },
  profilePic: {
    type: String,
    default: "", // Placeholder or default avatar
  },
});

module.exports = mongoose.model("Users", UsersSchema);