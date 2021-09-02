const mongoose = require("mongoose");
// const conn = mongoose.createConnection('mongodb://localhost:27017/writingDB', {useNewUrlParser:true,useUnifiedTopology:true});

const sharedSchema = new mongoose.Schema({
  user: String,
  date: String,
  title: String,
  content: String,
  comments: [],
  authorID: mongoose.ObjectId
});

const myDB = mongoose.connection.useDb('writingDB');

const Shared = myDB.model('Shared', sharedSchema);

module.exports = Shared;
