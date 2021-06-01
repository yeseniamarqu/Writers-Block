require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const app = express();
const db = require("./models")
const date = require("./models")
const bodyParser = require("body-parser");
const _ = require("lodash");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20')
const findOrCreate = require('mongoose-findorcreate');
let today = new Date();
let prompt = "";
let promptArr = [];

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

day = today.toLocaleDateString("en-us", date.Options)

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB',{
  useNewUrlParser:true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = new mongoose.model('User',userSchema);

passport.use(User.createStrategy()); //use passport to create local login localStrategy

passport.serializeUser(function(user,done){
  done(null,user.id);
});

passport.deserializeUser(function(id,done){
  User.findById(id, function(err,user){
    done(err,user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/dashboard"
},
function(accessToken, refreshToken, profile, cb){
  User.findOrCreate({googleId: profile.id}, function(err,user){
    return cb(err,user);
  });
}

));


app.get("/", function(req,res){
  res.render("login")
});
app.get("/auth/google",
  passport.authenticate("google",{scope:["profile"]})
);
app.get("auth/google/dashboard",
  passport.authenticate("google",{failureRedirect: "/login"}),
  function(req,res){
  res.redirect("/dashboard");

});


  app.get("/index", function(req, res) {
    db.Prompt.find(function(err, prompts) {
      if (err) {
        console.log(err);
      } else {
        prompt = _.sample(prompts)
        prompt = prompt.prompt;
        console.log(prompt);
      }
});
    res.render("index", {
      currentDay: day,
      todaysPrompt: prompt
    })
  });



app.get('/',function(req,res){
  res.render("login");
});

app.get('/register',function(req,res){
  res.render("register");
});

app.get('/dashboard',function(req,res){
  res.render("dashboard");
});



app.post('/login', function(req,res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res, function(){
        res.redirect("/dashboard");
      });
    }
  });
});

app.post("/register", function(req,res){
  User.register({
    username: req.body.username
  }, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req,res,function(){
          res.redirect("/dashboard");
      })
    }

  })
});





app.listen(3000, function() {
  console.log("Listening on port 3000")
});
