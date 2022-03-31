const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt-nodejs');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB, {useNewUrlParser: true});

//user schema
let UserSchema = new Schema({
    name: String,
    username: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    password:{
        type: String,
        required: true,
        select: false
    }
});

// pre save function
UserSchema.pre('save', function (next) {
    let user = this;

    //password hash
    if (!user.isModified('password')) return next();

    bcrypt.hash(user.password, null, null, function (err, hash) {
        if (err) return next(err);

        // change password
        user.password = hash;
        next();
    });
});

// function to compare passwords
UserSchema.methods.comparePassword = function (password, callback){
    const user = this;
    bcrypt.compare(password, user.password, (err, isMatch) => {
        callback(isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);

