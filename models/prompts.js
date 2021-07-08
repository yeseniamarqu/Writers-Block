const mongoose = require("mongoose");
// const conn = mongoose.createConnection('mongodb://localhost:27017/writingDB', {useNewUrlParser:true,useUnifiedTopology:true});

const promptSchema = new mongoose.Schema({
  category: String,
  prompt:String
});


const myDB = mongoose.connection.useDb('writingDB');

const Prompt = myDB.model('Prompt', promptSchema);


module.exports =  Prompt;
