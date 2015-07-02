var User = require('../models/user'),
    HttpError = require('../components/http-error'),
    Solution = require('../models/solution'),
    Quiz = require('../models/quiz'),
    _ = require('underscore'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    Course = require('../models/course');

exports.getAccount = function (req, res, next) {
    User.findById(req.user.id, function (err, user) {
        if (err) {
            return next(err);
        }
        return res.json({
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name
        });
    });
};

exports.deleteAccount = function (req, res, next) {
    User.findByIdAndRemove(req.user.id, function (err) {
        if (err) {
            return next(err);
        }
        return res.status(204).send();
    });
};

exports.listEnrolledCourses = function (req, res, next) {
    User.findById(req.user.id, function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new HttpError(404, 'User not found!'))
        }
        // find courses for which the user is enrolled
        Course.find({_id: {$in: user.enrollments}}, function (err, courses) {
            if (err) {
                return next(err);
            }
            // no enrollments
            if (!courses) {
                return res.json([]);
            }
            var result = courses.map(function (course) {
                return {id: course._id, title: course.title, description: course.description};
            });
            return res.json(result);
        });
    });
};

exports.listAuthoredCourses = function (req, res, next) {
    Course.find({author_id: req.user.id}, function (err, courses) {
        if (err) {
            return next(err);
        }
        // no authored courses
        if (!courses) {
            return res.json([]);
        }
        var result = courses.map(function (course) {
            return {id: course._id, title: course.title, description: course.description};
        });
        return res.json(result);
    });
};

exports.enroll = function (req, res, next) {
    User.findById(req.user.id, function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new HttpError(404, 'User not found!'))
        }
        // get course id
        var courseId = req.params.course_id;
        var index = user.enrollments.indexOf(courseId);
        if (index > -1) {
            return next(new HttpError(409, 'User is already enrolled in the course.'));
        }
        else {
            user.enrollments.push(courseId);
            user.save(function (err) {
                if (err) {
                    return next(err);
                }
                return res.status(204).send();
            });
        }
    });
};

exports.drop = function (req, res, next) {
    User.findById(req.user.id, function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new HttpError(404, 'User not found!'))
        }
        var courseId = req.query.course_id;
        var index = user.enrollments.indexOf(courseId);
        if (index > -1) {
            user.enrollments.splice(index, 1);
            user.save(function (err) {
                if (err) {
                    return next(err);
                }
                return res.status(204).send();
            });
        }
    });
};

exports.subscribe = function (req, res, next) {
    User.findById(req.user.id, function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new HttpError(404, 'User not found!'))
        }
        user.push_token = req.params.token;
        user.save(function (err) {
            if (err) {
                return callback(err);
            }
            return res.status(204).send();
        });
    });
};

exports.unsubscribe = function (req, res, next) {
    User.findById(req.user.id, function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new HttpError(404, 'User not found!'))
        }
        // clear push_token
        user.push_token = undefined;
        user.save(function (err) {
            if (err) {
                return next(err);
            }
            return req.status(204).send();
        });
    });
};

exports.getQuizSolutionAsync = async(function (req, res, next) {
    var userId = req.user.id;
    var quizId = req.params.quiz_id;
    try {
        var submission = await(Solution.findOne({user_id: userId}));
        var quiz = await(Quiz.findById(quizId));
        var result = quiz.questions.map(function (question) {
            // find solution to question
            var answer = _.find(submission.solutions, function (sol) {
                return sol.question_id == question.id
            });
            return {
                question: question.question,
                choices: question.choices,
                correct: question.correct,
                selected: answer ? answer.selected : null
            };
        });
        res.json(result);
    }
    catch (e) {
        return next(e);
    }
});