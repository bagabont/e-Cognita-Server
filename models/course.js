var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Quiz = require('./quiz');

var Course = new Schema({
    created: {type: Date, default: Date.now},
    authorId: {type: Schema.ObjectId},
    title: {type: String, unique: true, required: true},
    description: {type: String},
    quizzes: {type: [Quiz]},
    enrolledUsers: {type: [Schema.ObjectId]}
});

module.exports = mongoose.model('course', Course);