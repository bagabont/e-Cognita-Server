var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Question = new Schema({
    text: {type: String, unique: true, required: true},
    answers: {type: [String], required: true},
    correctAnswerIndex: {type: Number, required: true}
});

module.exports = mongoose.model('question', Question);