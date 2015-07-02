var mongoose = require('mongoose'),
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

Quiz.pre('save', function (next) {
    if (!this.date_created) {
        this.date_created = Date.now;
    }
    next();
});

module.exports = mongoose.model('Quiz', Quiz);