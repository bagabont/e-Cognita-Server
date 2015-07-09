var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Submission = new Schema({
    quiz_id: { type: Schema.ObjectId, required: true },
    user_id: { type: Schema.ObjectId, required: true },
    date_submitted: { type: Date },
    solutions: [{
            question_id: { type: Schema.ObjectId, required: true },
            selected: { type: Number },
            time_answered: { type: Number }
        }]
});

Submission.pre('save', function (next) {
    if (!this.date_submitted) {
        this.date_submitted = Date.now();
    }
    next();
});

module.exports = mongoose.model('Submission', Submission);