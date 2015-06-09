var gcm = require('node-gcm'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    Course = require('../models/course'),
    User = require('../models/user');

var gcmSender;

var Pusher = function (config) {
    gcmSender = new gcm.Sender(config.gcmApiKey);
};

Pusher.prototype.sendAsync = async(function (quiz, text, callback) {
    if (!quiz) {
        throw new Error('Quiz cannot be null');
    }
    var course = await(Course.findOne({_id: quiz.course_id}));
    if (!course) {
        throw new Error('Course not found!');
    }
    // find enrolled users
    var users = await(User.find({enrollments: course._id}));
    if (!users || users.length == 0) {
        return;
    }
    var tokens = users.map(function (user) {
        return user.pushToken;
    });

    var message = new gcm.Message();
    message.addData('quiz_id', quiz.id);
    message.addData('text', text);

    return await(function (callback) {
        return gcmSender.sendNoRetry(message, tokens, callback);
    });
});

module.exports = function (config) {
    return new Pusher(config)
};
