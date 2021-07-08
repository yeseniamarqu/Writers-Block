require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const ObjectID = require('mongodb')
const ejs = require('ejs');
const app = express();
const {Prompt, Shared}= require("./models")
const date = require("./models")
const bodyParser = require("body-parser");
const _ = require("lodash");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate = require('mongoose-findorcreate');
let today = new Date();
let prompt = "";
let promptArr = [];
let userId = {};

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
// mongoose.createConnection('mongodb://localhost:27017/writingDB', {useNewUrlParser:true,useUnifiedTopology:true});

mongoose.connect('mongodb://localhost:27017/writingDB',{
  useNewUrlParser:true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  googleId: String,
  facebookId: String,
  secret: String,
  writings: []
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = new mongoose.model('User',userSchema);

passport.use(User.createStrategy()); //use passport to create local login localStrategy

passport.serializeUser(function(user,done){
  userId = user.id
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
  User.findOrCreate({googleId: profile.id, name: profile.name.givenName }, function(err,user){
    console.log(profile);
    return cb(err,user);
  });
}

));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:3000/auth/facebook/dashboard"
},
function(accessToken,refreshToken,profile,cb){
  let firstName = _.split(profile.displayName," ",1);
  User.findOrCreate({facebookId: profile.id, name: firstName[0]}, function(err,user){
    console.log(profile)
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
app.get("/auth/google/dashboard",
  passport.authenticate("google",{failureRedirect: "/login"}),
  function(req,res){
  res.redirect("/dashboard");
});

app.get("/auth/facebook",
  passport.authenticate('facebook')
);

app.get("/auth/facebook/dashboard",
passport.authenticate('facebook', {failureRedirect: "/login"}),
function(req,res){
  res.redirect('/dashboard');
});




  app.get("/index", function(req, res) {
  // db.Prompt.find(function(err, prompts) {
  let us= {}
Prompt.find(function(err, prompts) {
      if (err) {
        console.log(err);
      } else {
        prompt = _.sample(prompts)
        prompt = prompt.prompt;
        console.log(prompts);
        // console.log(userId)
      }
      // User.findById(userId,function(err,u){
      //   console.log(u)
      //   us = u;
      // })
  });
    res.render("index", {
      currentDay: day,
      todaysPrompt: prompt,
    });
  });



app.get('/',function(req,res){
  res.render("login");
});

app.get('/register',function(req,res){
  res.render("register");
});

app.get('/dashboard',function(req,res){

Shared.find(function(err,shared){
  if(err){
    console.log(err);
  }
  else{

    res.render("dashboard",{
    writings: shared
      });
    }
  });
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

app.post("/index", function(req,res){
  const userWriting = {
    title: req.body.writingTitle,
    content: req.body.writingContent,
    date: day
  };
   console.log(userId)
   console.log(userWriting)
   var id = mongoose.Types.ObjectId(userId);
   User.update({_id: id}, {$push: {writings: userWriting}})


  // User.findById(userId, function(err,user){
   //  if(err){
   //    console.log(err);
   //  }
   //  else{
   //    console.log(user)
   //  user.writings.push(userWriting);
   //  User.save();
   // }

  res.redirect("/dashboard");
});





app.listen(3000, function() {
  console.log("Listening on port 3000")
});
