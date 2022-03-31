/*
* CSC3916 HW 3
* File: server.js
* Desc: Scaffolding for Movie API
*/

const cors = require('cors'),
    express = require('express'),
    jwt = require('jsonwebtoken'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    jwtAuthController = require('./auth_jwt'),
    app = express(),
    router = express.Router(),
    User = require('./schemas/Users'),
    Movie = require('./schemas/Movies'),
    Actor = require('./schemas/Actors');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

getActors = (req) => {
    let actorsList = [];
    let actors = req.body.actors;

    if(!actors){return actorsList;}

    actors.forEach(obj => {
        let actor = new Actor();
        actor.actorName = obj.actorName;
        actor.characterName = obj.characterName;
        actorsList.push(actor);
    })
    return actorsList;
}
router.post('/signup', (req, res) => {
    if(!req.body.username || !req.body.password){
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    }else{
        let user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save((err) => {
            if(err){
                if(err.code === 11000){
                    return res.json({success: false, message: 'A user with that username already exists. '});
                }else{
                    return res.json({success: false, error:err});
                }
            }
            res.json({success: true, msg: 'Successfully created new user.'});
        });
    }
});

router.post('/signin', (req, res) => {
    if(!req.body.username || !req.body.password){
        res.json({success: false, msg: 'Please include both username and password to sign in.'})
    }

    let userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({username: userNew.username}).select('name username password').exec((err,user) =>{
        if(err){
            res.status(401).send({success: false, msg: 'User not found.'});
        }
        user.comparePassword(userNew.password, (isMatch) =>{
            if (isMatch){
                let userToken = {name: user.name, username: user.username};
                let token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({success: true, token: 'JWT ' + token}); // use this for JWT a.b.c token
                // res.json({success: true, token: token}); // use this for Bearer token
            }else{
                res.status(401).send({success: false, msg: 'Authentication Failed.'});
            }
        })
    })
});

router.route('/movies')
    .get(jwtAuthController.isAuthenticated, (req, res) => {
        Movie.find({}, (err, movies) => {
            if (err){
                return res.json({success: false, error:err});
            }
            return res.status(200).send({success:true, movies:movies});
        });
    })
    .post(jwtAuthController.isAuthenticated, (req, res) => {
        let movie = new Movie();
        let actorList = getActors(req);

        movie.title = req.body.title;
        movie.releaseDate = new Date(req.body.releaseDate);
        movie.genre = req.body.genre;
        movie.actors = actorList;

        movie.save((err) => {
            if(err){
                return res.send({success: false, error:err});
            }
            res.status(200).send({success: true, msg: 'Successfully saved new Movie.'});
        });
    })
    .put(jwtAuthController.isAuthenticated, (req, res) => {
        Movie.findOne({title: req.body.title}, (err, movie) => {
            if (err){
                return res.json({success: false, error:err});
            }else{
                let actorList = getActors(req);
                // movie.title = req.body.title;
                movie.releaseDate = new Date(req.body.releaseDate);
                movie.genre = req.body.genre;
                movie.actors = actorList;

                movie.save();
                res.status(200).send({success: true, msg: 'Successfully updated the Movie.'});
            }
        });
    })
    .delete(jwtAuthController.isAuthenticated, (req, res) => {
        Movie.findOneAndDelete({title:req.body.title}, (err, movie) => {
            if(err){
                return res.json({success: false, error:err});
            }
            res.status(200);
            res.json({success: true, msg:'Movie deleted successfully.', deleted: movie});
        });
    });

app.use('/', router);
app.listen(process.env.PORT || 3000);
module.exports = app;