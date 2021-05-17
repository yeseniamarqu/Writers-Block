const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const app = express();

app.set('view engine', 'ejs');
mongoose.connect('mongodb://localhost:27017/writingDB', {useNewUrlParser:true,useUnifiedTopology:true});

const promptSchema = new mongoose.Schema({
  category: String,
  prompt:String
});

const Prompt = mongoose.model('Prompt', promptSchema);



Prompt.find(function(err,prompts){
  if(err){
    console.log(err);
  }
  else{
    console.log(prompts);
  }
});



app.use(express.static("public"));

app.get("/", function(req,res){
  res.render("index")
})




app.listen(3000, function(){
  console.log("Listeing on port 3000")
})
