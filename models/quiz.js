var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Question = require('./question');

var Quiz = new Schema({
    created: {type: Date, default: Date.now},
    title: {type: String, unique: true, required: true},
    description: {type: String},
    questions: {type: [Question]}
});

module.exports = mongoose.model('quiz', Quiz);