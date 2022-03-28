const passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy;

passport.use(new BasicStrategy(
    function(username, password, done){
        let user = db.findOne(username);
        if(user && password === user.password){
            return done(null, user);
        }else{
            return done(null, false);
        }
    }
));

exports.isAuthenticated = passport.authenticate('basic', {session: false});