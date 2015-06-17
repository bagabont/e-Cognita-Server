var mongoose = require('mongoose'),
    QuizSolution = require('../models/quiz-solution'),
    Schema = mongoose.Schema,
    async = require('asyncawait/async'),
    await = require('asyncawait/await');

var Quiz = new Schema({
    created: {type: Date, default: Date.now},
    title: {type: String, required: true},
    from: {type: Date},
    due: {type: Date},
    datePublished: {type: Date},
    description: {type: String},
    course_id: {type: Schema.ObjectId, required: true},
    questions: [{
        text: {type: String, required: true},
        answers: {type: [String], required: true},
        correctAnswerIndex: {type: Number, required: true}
    }]
});

Quiz.methods.toQuizJsonAsync = async(function () {
    var self = this;
    var sol = await(QuizSolution.findOne({quiz: self._id}));
    var dateSolved;
    if (sol) {
        dateSolved = sol.created;
    }
    return {
        id: self._id,
        created: this.created,
        title: this.title,
        course: this.course_id,
        description: this.description,
        from: this.from,
        due: this.due,
        date_solved: dateSolved,
        date_published: !this.datePublished ? null : this.datePublished
    }
});

module.exports = mongoose.model('quiz', Quiz);