const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  sharedID: mongoose.ObjectId,
  authorID: mongoose.ObjectId,
  posterID: mongoose.ObjectId,
  comment: String,
  author: String,
  time: String
});

const myDB = mongoose.connection.useDb('writingDB');

const Comment = myDB.model('Comment', commentSchema);

module.exports = Comment;
