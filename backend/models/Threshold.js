const mongoose = require("mongoose");

const thresholdSchema = new mongoose.Schema({
  email: { type: String, required: true },
  city: { type: String, required: true },
  temperature: { type: Number },
  condition: { type: String },
});

const Threshold = mongoose.model("Threshold", thresholdSchema);

module.exports = Threshold;
