const mongoose = require("mongoose");

const promptSchema = new mongoose.Schema({
  category: String,
  prompt:String
});

const Prompt = mongoose.model('Prompt', promptSchema);

module.exports = Prompt;
