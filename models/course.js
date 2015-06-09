var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Course = new Schema({
    created: {type: Date, default: Date.now},
    authorId: {type: Schema.ObjectId},
    title: {type: String, unique: true, required: true},
    description: {type: String},
    enrolledUsers: {type: [Schema.ObjectId]}
});

module.exports = mongoose.model('course', Course);