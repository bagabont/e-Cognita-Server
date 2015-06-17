var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var QuizSolution = new Schema({
    created: {type: Date, default: Date.now},
    quiz: {type: Schema.ObjectId, required: true},
    author: {type: Schema.ObjectId, required: true},
    answers: [{
        question: {type: Schema.ObjectId, required: true},
        choice: {type: Number}
    }]
});

module.exports = mongoose.model('quiz-solutions', QuizSolution);