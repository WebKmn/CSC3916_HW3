const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB, {useNewUrlParser: true});

ActorSchema = new Schema({
    actorName: {
        type: String,
        required: true
    },
    characterName: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Actor', ActorSchema);