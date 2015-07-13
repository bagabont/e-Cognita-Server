var mongoose = require('mongoose'),
    _ = require('underscore'),
    Schema = mongoose.Schema;

var Quiz = new Schema({
    course_id: {
        type: Schema.ObjectId,
        required: true
    },
    date_created: {
        type: Date
    },
    date_published: {
        type: Date
    },
    date_due: {
        type: Date
    },
    date_closed: {
        type: Date
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    questions: [{
        question: {
            type: String,
            required: true
        },
        choices: {
            type: [String],
            required: true
        },
        correct: {
            type: Number,
            required: true
        }
    }]
});

Quiz.methods.isClosed = function () {
    return this.date_closed !== undefined;
};

Quiz.methods.hasQuestions = function () {
    if (!this.questions || this.questions.length <= 0) {
        return false;
    }
    for (var i = 0; i < this.questions.length; i++) {
        var question = this.questions[i];
        if (!question.choices || question.choices.length <= 0) {
            return false;
        }
    }
    return true;
};

Quiz.pre('save', function (next) {
    if (!this.date_created) {
        this.date_created = Date.now();
    }
    next();
});

module.exports = mongoose.model('Quiz', Quiz);
