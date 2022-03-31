const passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt,
    User = require('./schemas/Users'),
    opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt'); // use for JWT a.b.c token
// opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); // use for Bearer token, fails test
opts.secretOrKey = process.env.SECRET_KEY;

    passport.use(new JwtStrategy(opts,
    function(jwt_payload, done){
        User.find({username:jwt_payload.username}, (err, user) =>{
            if(err) {
                console.log(jwt_payload);
                console.log(user);
                return done(null, false);
            }else{
                return done(null, user);
            }
        });
    }
));

exports.isAuthenticated = passport.authenticate('jwt', {session: false});
exports.secret = opts.secretOrKey;