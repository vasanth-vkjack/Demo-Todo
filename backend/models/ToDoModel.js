const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  userId: {
    ref: "Todo",
    type: mongoose.Schema.Types.ObjectId,
  },
  text: {
    type: String,
    require: true,
  },
  description: { type: String },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending",
  },
});

module.exports = mongoose.model("Todo", todoSchema);
