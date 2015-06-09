var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Quiz = new Schema({
    created: {type: Date, default: Date.now},
    title: {type: String, required: true},
    description: {type: String},
    course_id: {type: Schema.ObjectId, required: true},
    questions: [{
        text: {type: String, required: true},
        answers: {type: [String], required: true},
        correctAnswerIndex: {type: Number, required: true}
    }]
});

module.exports = mongoose.model('quiz', Quiz);