var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Quiz = require('./quiz');

var Course = new Schema({
    created: {type: Date, default: Date.now},
    title: {type: String, unique: true, required: true},
    subTitle: {type: String},
    description: {type: String},
    quizzes: {type: [Quiz]}
});

module.exports = mongoose.model('course', Course);