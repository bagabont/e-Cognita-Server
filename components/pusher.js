var gcm = require('node-gcm'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    Course = require('../models/course'),
    User = require('../models/user');

var gcmSender;

var Pusher = function (config) {
    gcmSender = new gcm.Sender(config.gcmApiKey);
};

Pusher.prototype.send = async(function (quiz, text) {
    if (!quiz) {
        throw new Error('Quiz cannot be null');
    }
    var course = await(Course.findOne({_id: quiz.course_id}));
    if (!course) {
        throw new Error('Course not found!');
    }

    var users = await(User.find({_id: course.enrolledUsers}));
    if (!users || users.length == 0) {
        return;
    }
    var tokens = users.map(function (user) {
        return user.pushToken;
    });

    var message = new gcm.Message();
    message.addData('quiz_id', quiz.id);
    message.addData('text', text);

    return await(gcmSender.sendNoRetry(message, tokens));
});

module.exports = function (config) {
    return new Pusher(config)
};
