const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const app = express();
const db = require("./models")
const date = require("./models")
var today = new Date();

app.set('view engine', 'ejs');
mongoose.connect('mongodb://localhost:27017/writingDB', {useNewUrlParser:true,useUnifiedTopology:true});



day = today.toLocaleDateString("en-us",date.Options)

  db.Prompt.find(function(err,prompts){
    if(err){
      console.log(err);
    }
    else{
    console.log(prompts);
    }
  });


app.use(express.static("public"));

app.get("/", function(req,res){
  res.render("index", {currentDay: day})
})




app.listen(3000, function(){
  console.log("Listeing on port 3000")
});
