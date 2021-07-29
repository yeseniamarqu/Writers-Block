const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema({
  title: String,
  content: String,
  date: String,
  author: mongoose.ObjectId
});

const myDB = mongoose.connection.useDb('writingDB');

const Journal = myDB.model('Journal', journalSchema);

module.exports = Journal;
