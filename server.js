var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

var path = require('path');
app.use(express.static(path.join(__dirname, '/static')));
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
var mongoose = require('mongoose'); //require mongoose
mongoose.connect('mongodb://localhost/mongo_messagedb');
mongoose.Promise = global.Promise;

var Schema = mongoose.Schema;

var PostSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 3},
    text: {type: String, required: true},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
}, {timestamps: true})
mongoose.model('Post', PostSchema);
var Post = mongoose.model('Post');

var CommentSchema = new mongoose.Schema({
    _post: {type: Schema.Types.ObjectId, ref: 'Post'},
    name: {type: String, required: true, minlength: 3}, 
    text: {type: String, required: true}
}, {timestamps: true})

mongoose.model('Post', PostSchema);
mongoose.model('Comment', CommentSchema);
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');





app.get('/', function(req, res){
    Post.find().populate('comments').exec(function(err, posts){
        if(err){
            console.log('Something went wrong fetching the posts');
        }
        else{
            res.render('index', {posts});
        }
    })
})

app.post('/post', function(req, res){
    console.log("post data:", req.body);
    var new_post = new Post({name: req.body.name, text: req.body.text});
    new_post.save(function(err){
        if(err){
            console.log('Something went wrong creating post');
            res.render('index', {errors: new_post.errors});
        }
        else{
            console.log('Successfully created a new Post');
            res.redirect('/');
        }
    })
})

app.post('/post/:id', function(req, res){
    Post.findOne({_id: req.params.id}, function(err, post){
        var comment = new Comment({name: req.body.name, text: req.body.text});
        comment._post = post._id;
        comment.save(function(err){
            post.comments.push(comment);
            post.save(function(err){
                if(err){
                    console.log('Something went wrong adding comment');
                }
                else{
                    res.redirect('/');
                }
            })
        })
    })
})



app.listen(8000, function(){
    console.log("Listening on port 8000");
})