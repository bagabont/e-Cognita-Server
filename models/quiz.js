var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Quiz = new Schema({
    created: {type: Date, default: Date.now},
    title: {type: String, unique: true, required: true},
    description: {type: String},
    questions: [{
        text: {type: String, unique: true, required: true},
        answers: {type: [String], required: true},
        correctAnswerIndex: {type: Number, required: true}
    }]
});

module.exports = mongoose.model('quiz', Quiz);