//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");

require('dotenv').config()
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const GitHubStrategy = require('passport-github2').Strategy;



const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis partrient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

app.use(session({
  secret: 'This is a secret code.',
  resave: false,
  saveUninitialized: false,
}))

app.use(passport.initialize());
app.use(passport.session());


const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://admin-ratnesh:test123@cluster0.c7iws.mongodb.net/blogpostDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex",true)

const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    author:String
});

const userSchema=new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    blogs:[postSchema],
    googleId:String,
    githubId:String
})
userSchema.plugin(findOrCreate);
userSchema.plugin(passportLocalMongoose);

const User=new mongoose.model("User",userSchema);
const Post = new mongoose.model("Post", postSchema);

// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

//Google Strategy

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://postblogsite.herokuapp.com/auth/google/compose",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
//    console.log(profile)
    const userName=_.capitalize(profile.displayName);
    User.findOrCreate({ googleId: profile.id , username:userName}, function (err, user) {
      return cb(err, user);
    });
  }
));


//github strategy

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://postblogsite.herokuapp.com/auth/github/compose"
  },
  function(accessToken, refreshToken, profile, done) {
//    console.log(profile.username)
    const userName=_.capitalize(profile.username);
    User.findOrCreate({ githubId: profile.id,username:userName }, function (err, user) {
      return done(err, user);
    });
  }
));



app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] }));

app.get("/auth/google/compose", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/compose");
  });

app.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email'] }));

app.get('/auth/github/compose', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/compose');
  });



app.get('/', (req, res) => {
    var username;
    if(req.isAuthenticated()){
        username=req.user.username;
    }
    else{
        username="User"
    }
//    console.log(username)
    Post.find({}, (err, posts) => {
        res.render('home.ejs', {
            homeStartingContent: homeStartingContent,
            posts: posts,
            userName:username
            
        });
    })
})


app.get('/about', (req, res) => {
    var username;
    if(req.isAuthenticated()){
        username=req.user.username;
    }
    else{
        username="User"
    }
    res.render('about.ejs', {
        aboutContent: aboutContent,
        userName:username
        
    });
})
app.get('/contact', (req, res) => {
    var username;
    if(req.isAuthenticated()){
        username=req.user.username;
    }
    else{
        username="User"
    }
    res.render('contact.ejs', {
        contactContent: contactContent,
        userName:username
    });
})

app.get("/compose",(req,res)=>{
    
    if(req.isAuthenticated()){
        res.render("compose",{userName:req.user.username})
    }
    else{
        res.redirect("/login")
    }
})


app.route("/register")

.get((req,res)=>{
    var username;
    if(req.isAuthenticated()){
        username=req.user.username;
    }
    else{
        username="User"
    }
    res.render("register",{userName:username});
})
.post((req,res)=>{
//    console.log(req.body);
  User.register({username:req.body.username , email:req.body.email},req.body.password , (err,user)=>{
      if(err){
//          console.log(err)
          res.redirect("/register")
      }else{
//        console.log("err")
          passport.authenticate("local")(req,res,()=>{
              res.redirect("/compose")
          })
      }
  })
    
})


app.route("/login")

.get((req,res)=>{
    res.render("login",{userName:"User"});
})
.post((req,res)=>{
    
    const user=new User({
        username:req.body.username,
        password:req.body.password,
        email:req.body.email
    });
    
    req.login(user,(err)=>{
        if(err){
//            console.log(err);
        }else{
            passport.authenticate("local")(req,res,()=>{
              res.redirect("/compose")
          })
        }
    })
    
});

app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/")
})



app.get('/posts/:topic', (req, res) => {
    var username;
    if(req.isAuthenticated()){
        username=req.user.username;
    }
    else{
        username="User"
    }
    let id = [req.params.topic];
    Post.findOne({_id:id},(err,post)=>{
        res.render('post.ejs',{
            post:post,
            userName:username
        });
    })
})

app.get("/blogs",(req,res)=>{
    if(req.isAuthenticated()){
        let id = req.user._id;
        User.findById(id,(err,user)=>{
//            console.log(user);
            let b=[{title:"",content:"No records were found."}]
            if(user.blogs.length!=0)b=user.blogs;
            res.render('blogs',{
                
                posts:b,
                userName:req.user.username
            });
        })
    }
    else{
        res.redirect("/login")
    }
})


app.post("/",(req,res)=>{
    if(req.isAuthenticated()){
        let postTitle = req.body.postTitle;
        let postBody = req.body.postBody;
//        console.log(req.user)
        let author=req.user.username
        
        const post1 = new Post({
        title: _.capitalize(postTitle),
        content: postBody,
            author:author
        });
        User.findById(req.user.id,(err,user)=>{
            user.blogs.push(post1);
            user.save()
        })
        post1.save((err)=>{
            if(!err){
                res.redirect('/');
            }
        })
    }
    else{
        res.redirect("/login")
    }
})






app.get('/register', (req, res) => {
    res.render('register',{userName:username});
})
app.get('/login', (req, res) => {
    res.render('login',{userName:username});
})




app.listen(process.env.PORT || 3000, () => {
    console.log("Server Working....")
})
