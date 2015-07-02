var mongoose = require('mongoose'),
    _ = require('underscore'),
    Schema = mongoose.Schema;

var Quiz = new Schema({
    course_id: {type: Schema.ObjectId, required: true},
    date_created: {type: Date},
    date_published: {type: Date},
    date_due: {type: Date},
    title: {type: String, required: true},
    description: {type: String},
    questions: [{
        question: {type: String, required: true},
        choices: {type: [String], required: true},
        correct: {type: Number, required: true}
    }]
});

Quiz.methods.hasQuestions = function () {
    if (!this.questions || this.questions.length <= 0) {
        return false;
    }
    for (var i = 0; i < this.questions.length; i++) {
        var question = this.questions[i];
        if (!question.choices.length || question.choices.length <= 0) {
            return false;
        }
    }
};

Quiz.pre('save', function (next) {
    if (!this.date_created) {
        this.date_created = Date.now;
    }
    next();
});

Quiz.methods.evaluateSolution = function (submission) {
    var totalQuestions = this.questions.length;
    // count correct answers
    var correctAnswers = this.questions.filter(function (question) {
        var answer = _.find(submission.solutions, function (solution) {
            return solution.question_id == question.id
        });
        if (!answer) {
            return false;
        }
        return (question.correct == answer.selected);
    }).length;

    // return score
    return (correctAnswers / totalQuestions);
};

module.exports = mongoose.model('Quiz', Quiz);