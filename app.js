//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis partrient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://admin-ratnesh:test123@cluster0.c7iws.mongodb.net/blogpostDB", {
    useNewUrlParser: true
}, {
    useUnifiedTopology: true
})


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

const postSchema = new mongoose.Schema({
    title: String,
    content: String
});

const Post = mongoose.model("Post", postSchema);

let posts = [];


app.get('/', (req, res) => {
    Post.find({}, (err, posts) => {
        res.render('home.ejs', {
            homeStartingContent: homeStartingContent,
            posts: posts,
        });
    })

})

app.get('/about', (req, res) => {
    res.render('about.ejs', {
        aboutContent: aboutContent,
    });
})

app.get('/contact', (req, res) => {
    res.render('contact.ejs', {
        contactContent: contactContent,
    });
})

app.get('/compose', (req, res) => {
    res.render('compose.ejs');
})
app.get('/posts/:topic', (req, res) => {
    let id = [req.params.topic];
    
    Post.findOne({_id:id},(err,post)=>{
        res.render('post.ejs',{
            post:post
        });
    })
})



app.post('/', (req, res) => {

    let postTitle = req.body.postTitle;
    let postBody = req.body.postBody;

    const post1 = new Post({
        title: _.capitalize(postTitle),
        content: postBody
    });
    post1.save((err)=>{
        if(!err){
            res.redirect('/');
        }
    })
    
})


app.listen(process.env.PORT || 3000, () => {
    console.log("Server Working....")
})
