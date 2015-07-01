var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Solution = new Schema({
    quiz_id: {type: Schema.ObjectId, required: true},
    user_id: {type: Schema.ObjectId, required: true},
    date_submitted: {type: Date},
    selections: [{
        question_id: {type: Schema.ObjectId, required: true},
        selected: {type: Number},
        time: {type: Number}
    }]
});

Solution.pre('save', function (next) {
    if (!this.date_submitted) {
        this.date_submitted = Date.now;
    }
    next();
});

module.exports = mongoose.model('Solution', Solution);