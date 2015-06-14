var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

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

Quiz.methods.getMinimalInfo = function () {
    return {
        id: this._id,
        created: this.created,
        title: this.title,
        from: this.from,
        due: this.due,
        published: this.datePublished,
        course: this.course_id,
        description: this.description
    };
};

module.exports = mongoose.model('quiz', Quiz);