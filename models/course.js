var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Course = new Schema({
    date_created: {
        type: Date
    },
    author_id: {
        type: Schema.ObjectId
    },
    title: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String
    }
});

Course.pre('save', function(next) {
    if (!this.date_created) {
        this.date_created = Date.now();
    }
    next();
});

module.exports = mongoose.model('Course', Course);
