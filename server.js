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
    authController = require('./auth'),
    jwtAuthController = require('./auth_jwt'),
    app = express(),
    router = express.Router(),
    User = require('./Users');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

function getJSONobject(req){
    const json = {
        status: 'No Status',
        msg: 'No Msg Set',
        headers: 'No Headers',
        query: 'No Query',
        key: process.env.UNIQUE_KEY,
        body: 'No Body'
    };

    if (req.headers != null){
        json.headers = req.headers;
    }

    if (req.params.query != null){
        json.query = req.params.query;
    }

    if (req.body != null){
        json.body = req.body;
    }

    return json
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
                if(err.code == 11000){
                    return res.json({success: false, message: 'A user with that username already exists. '});
                }else{
                    return res.json(err);
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
                let userToken = {id: user.id, username: user.username};
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
    .get((req, res) =>{
        res.status(200);
        let obj = getJSONobject(req);
        obj.status = res.statusCode;
        obj.msg = 'Get Movies';
        res.json(obj);

    })
    .post((req, res) =>{
        res.status(200);
        let obj = getJSONobject(req);
        obj.status = res.statusCode;
        obj.msg = 'Movie Saved';
        res.json(obj);
    })
    .put(jwtAuthController.isAuthenticated, (req, res) =>{
        console.log(req.body);
        res.status(200);
        if(req.get('Content-Type')){
            res.type(req.get('Content-Type'));
        }
        let obj = getJSONobject(req);
        obj.status = res.statusCode;
        obj.msg = 'Movie Updated';
        res.json(obj);
    })
    .delete(authController.isAuthenticated, (req, res) =>{
        console.log(req.body);
        res.status(200);
        if(req.get('Content-Type')){
            res.type(req.get('Content-Type'));
        }
        let obj = getJSONobject(req);
        obj.status = res.statusCode;
        obj.msg = 'Movie Deleted';
        res.json(obj);
    });

app.use('/', router);
app.listen(process.env.PORT || 3000);
module.exports = app;