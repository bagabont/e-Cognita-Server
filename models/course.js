var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Course = new Schema({
    title: {type: String, unique: true, required: true},
    subTitle: {type: String},
    description: {type: String},
    created: {type: Date, default: Date.now}
});

module.exports = mongoose.model('course', Course);