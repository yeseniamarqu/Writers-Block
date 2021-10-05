require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const ObjectID = require('mongodb');
const ejs = require('ejs');
const app = express();
const {
  Comment,
  Journal,
  Prompt,
  Shared,
  Task,

} = require("./models")
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
let userId = "";
let pastJournals = [];
let sharedJournals = [];
let writingTitle = "";
let writingContent = "";
let writingDate = "";
let currentUser = '';
let userInfo = {};
let postComments = {}


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

day = today.toLocaleDateString("en-us", date.Options)

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/writingDB', {
  useNewUrlParser: true,
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

});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy()); //use passport to create local login localStrategy

passport.serializeUser(function(user, done) {
  userInfo = user;
  userId = String(user.id);
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/dashboard"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({
      googleId: profile.id,
      name: profile.name.givenName
    }, function(err, user) {
      return cb(err, user);
    });
  }

));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/dashboard"
  },
  function(accessToken, refreshToken, profile, cb) {
    let firstName = _.split(profile.displayName, " ", 1);
    User.findOrCreate({
      facebookId: profile.id,
      name: firstName[0]
    }, function(err, user) {
      return cb(err, user);
    });
  }
));


app.get("/", function(req, res) {
  res.render("login")
});
app.get("/freeJournaling", function(req, res) {
  res.render("freeJournaling", {
    name: currentUser
  })
})
app.get("/auth/google",
  passport.authenticate("google", {
    scope: ["profile"]
  })
);
app.get("/auth/google/dashboard",
  passport.authenticate("google", {
    failureRedirect: "/failedlogin"
  }),
  function(req, res) {
    res.redirect("/dashboard");
  });

app.get("/auth/facebook",
  passport.authenticate('facebook')
);

app.get("/auth/facebook/dashboard",
  passport.authenticate('facebook', {
    failureRedirect: "/failedlogin"
  }),
  function(req, res) {
    res.redirect('/dashboard');
  });




app.get("/index", function(req, res) {
  Prompt.find(function(err, prompts) {
    if (err) {
      console.log(err);
    } else {
      prompt = _.sample(prompts)
      prompt = prompt.prompt;
    }
  });
  res.render("index", {
    currentDay: day,
    todaysPrompt: prompt,
  });
});



app.get('/', function(req, res) {
  res.render("login");
});

app.get('/register', function(req, res) {
  res.render("register");
});

app.get('/dashboard', function(req, res) {


  let todo = '';
  Task.find(function(err, tasks) {
    if (err) {
      console.log(err)
    } else {
      todo = tasks;
    }
  })



  Shared.find(function(err, shared) {
    if (err) {
      console.log(err);
    } else {
      sharedJournals = shared;
      res.render("dashboard", {
        name: userInfo.name,
        writings: shared,
        todos: todo

      });
    }
  });
});

app.get("/writings", function(req, res) {

  Journal.find({
    "author": userId
  }, function(err, entries) {
    if (err) {
      console.log(err);
    } else {
      pastJournals = entries
      res.render("writings", {
        pastWritings: entries
      })
    }

  })

});


app.get("/journal/:id", function(req, res) {
  pastJournals.forEach(function(pastJournal) {
    storedTitle = _.lowerCase(pastJournal.title);
    storedWriting = pastJournal.content;
    storedDate = pastJournal.date;
    storedId = pastJournal._id;

    if (req.params.id == storedId) {
      res.render('journal', {
        writingTitle: storedTitle,
        writingContent: storedWriting,
        writingDate: storedDate,
        writingId: storedId
      });
    }
  });

});

app.get("/view/:ID", function(req, res) {

  sharedJournals.forEach(function(sharedJournal) {
    sharedDBTitle = sharedJournal.title;
    sharedDBJournal = sharedJournal.content;
    sharedDBDate = sharedJournal.date;
    sharedDBUsername = sharedJournal.username;
    sharedDBauthorId = sharedJournal.authorID;
    sharedDBId = sharedJournal._id;


    if (req.params.ID == sharedDBId) {

      res.render('view', {
        sharedId: sharedDBId,
        sharedAuthorId: sharedDBauthorId,
        sharedTitle: sharedDBTitle,
        sharedUsername: sharedDBUsername,
        sharedContent: sharedDBJournal,
        sharedDate: sharedDBDate,


      });
    }
  });
});

app.get('/failedlogin', function(req,res){
  res.render('failedlogin');
})




app.post('/login', function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err) {
    if (err) {
      res.redirect('/failedlogin')
      console.log(err);
    } else {
      userId = String(user.id)
      passport.authenticate("local")(req, res, function() {
        res.redirect("/dashboard");
      });
    }
  });
});

app.post("/register", function(req, res) {
  User.register({
    username: req.body.username,
    name: req.body.name,
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/");
      })
    }

  })
});


app.post("/journal", function(req, res) {

  if (req.body.hasOwnProperty("publish-button")) {
    const sharedWriting = new Shared({
      authorID: userId,
      user: currentUser,
      date: day,
      title: req.body.title,
      content: req.body.content
    });
    sharedWriting.save();
    res.redirect("/dashboard");
  }

  if (req.body.hasOwnProperty("save-button")) {
    Journal.updateOne({
      _id: mongoose.Types.ObjectId(req.body.id),
    }, {
      'title': req.body.title,
      'content': req.body.content,
      'date': today
    }, function(err) {
      if (err) {
        console.log(err)
      }
    });

    res.redirect("/writings");
  }
});



app.post("/delete", function(req, res) {

  let taskID = req.body.checkItem;
  Task.deleteOne({
      _id: taskID
    },
    function(err) {
      if (err) {
        console.log(err);
      }

    });
  res.redirect('/dashboard');

});

app.post("/todo", function(req, res) {
  const newTask = new Task({
    name: req.body.newItem
  }, function(err) {
    if (err) {
      console.log(err);
    }

  });

  newTask.save();

  res.redirect("/dashboard");
});


app.post("/index", function(req, res) {
  const newEntry = new Journal({
    title: req.body.writingTitle,
    content: req.body.writingContent,
    date: today,
    author: userId
  });

  newEntry.save();
  res.redirect("/dashboard");
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});





app.listen(3000, function() {
  console.log("Listening on port 3000")
});
