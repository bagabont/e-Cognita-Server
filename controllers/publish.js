var gcm = require('node-gcm').Sender,
    Course = require('../models/course'),
    Quiz = require('../models/quiz');

exports.publishQuiz = function (req, res, next) {
    var gcmSender = new gcm.Sender(config.gcmApiKey);

    Quiz.findById(req.params.id, function (err, quiz) {
        if (err) {
            return next(err);
        }
        if (!quiz) {
            return next(new HttpError(404, 'Quiz not found.'))
        }
        var message = req.body.message;
        var overwrite = req.query.overwrite;

        // check if quiz is already published
        var isPublished = quiz.date_published !== undefined;
        if (isPublished && overwrite !== 'true') {
            return next(new HttpError(403, 'Quiz is already published.'));
        }

        // find enrolled users
        User.find({enrollments: quiz.course_id}, function (err, users) {
            if (err) {
                return next(err);
            }
            // no users found to be notified
            if (!users || users.length == 0) {
                return res.status(204).send();
            }
            var gcmMessage = new gcm.Message();
            gcmMessage.addData('quiz_id', quiz.id);
            gcmMessage.addData('message', message);
            var tokens = users.map(function (user) {
                return user.push_token;
            });
            gcm.sendNoRetry(gcmMessage, tokens, function (result) {
                // if result is undefined or no messages
                // were successfully sent,return false
                var success = result ? result.success > 0 : false;
                if (!success) {
                    return res.status(204).send();
                }
                quiz.date_published = new Date();
                quiz.save(function (err) {
                    if (err) {
                        return next(err);
                    }
                    return res.status(204).send();
                })
            });
        });
    });
};
