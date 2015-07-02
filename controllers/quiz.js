var HttpError = require('../components/http-error'),
    User = require('../models/user'),
    validator = require('validator'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    Course = require('../models/course'),
    Solution = require('../models/solution'),
    Quiz = require('../models/quiz'),
    _ = require('underscore'),
    gcm = require('node-gcm');

var env = process.env.NODE_ENV || 'development';
var config = config = require('../config/config')[env];
var gcmSender = new gcm.Sender(config.gcmApiKey);

function prepareQuiz(quiz) {
    return {
        id: quiz.id,
        date_created: quiz.date_created || null,
        title: quiz.title,
        course_id: quiz.course_id,
        description: quiz.description || null,
        date_due: quiz.date_due || null,
        date_published: quiz.date_published || null
    }
}

function validateQuiz(quiz) {
    var errors = [];
    if (!quiz) {
        errors.push('Invalid or missing request content.');
    }
    if (!quiz.course_id) {
        errors.push('Invalid or missing course_id.');
    }
    if (!validator.isLength(quiz.title, 1)) {
        errors.push('Invalid or missing title.');
    }
    if (errors.length > 0) {
        return {success: false, errors: errors.join()};
    }
    return {success: true, errors: null};
}

exports.listQuizzes = function (req, res, next) {
    var courseId = req.query.course_id;
    var options = courseId ? {course_id: courseId} : {};
    Quiz.find(options, function (err, quizzes) {
        if (err) {
            return next(err);
        }
        if (!quizzes) {
            return res.json([]);
        }
        return res.json(quizzes.map(function (quiz) {
            return prepareQuiz(quiz)
        }));
    });
};

exports.createQuiz = function (req, res, next) {
    var quizData = req.body;
    var result = validateQuiz(quizData);
    if (!result.success) {
        return next(new HttpError(400, result.errors));
    }
    Course.findById(quizData.course_id, function (err, course) {
        if (err) {
            return next(err);
        }
        if (!course) {
            return next(new HttpError(404, 'The course specified for this quiz cannot be found.'));
        }
        Quiz.create(quizData, function (err) {
            if (err) {
                return next(err);
            }
            return res.status(201).send();
        });
    })
};

exports.getQuizById = function (req, res, next) {
    Quiz.findById(req.params.id, function (err, quiz) {
        if (err) {
            return next(err);
        }
        if (!quiz) {
            return next(new HttpError(404, 'Quiz not found.'))
        }
        else {
            res.json(prepareQuiz(quiz));
        }
    });
};

exports.getQuestions = function (req, res, next) {
    Quiz.findById(req.params.id, function (err, quiz) {
        if (err) {
            return next(err);
        }
        if (!quiz) {
            return next(new HttpError(404, 'Quiz not found.'))
        }
        var now = new Date();
        // Check if quiz has due time.
        if (quiz.date_due && quiz.date_due > now) {
            return next(new HttpError(410, 'The quiz is no longer available.'));
        }
        var questions = quiz.questions;
        var result = questions.map(function (question) {
            return {
                id: question._id,
                question: question.question,
                choices: question.choices
            }
        });
        return res.status(200).json(result);
    });
};

exports.publishQuiz = function (req, res, next) {
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
        if (!quiz.hasQuestions()) {
            return next(new HttpError(400, 'Quiz without any questions cannot be published.'))
        }
        // find enrolled users
        User.find({enrollments: quiz.course_id}, function (err, users) {
            if (err) {
                return next(err);
            }

            var gcmMessage = new gcm.Message();
            gcmMessage.addData('quiz_id', quiz.id);
            gcmMessage.addData('message', message);


            var tokens = [];
            if (users && users.length > 0) {
                tokens = users.map(function (user) {
                    return user.push_token || '';
                });
            }

            gcmSender.send(gcmMessage, tokens, function (gcmError, result) {
                quiz.date_published = new Date();
                quiz.save(function (err) {
                    if (err) {
                        return next(err);
                    }
                    return res.status(200).json({
                        result: result,
                        gcm_error: gcmError
                    });
                })
            });
        });
    });
};

exports.getSolutions = async(function (req, res, next) {
    var solutions = await(Solution.find({quiz_id: req.params.id}));
    var result = [];
    for (var i = 0; i < solutions.length; i++) {
        var solution = solutions[i];
        var userId = solution.user_id;
        try {
            var user = await(User.findById(userId));
            var formattedSolutions = solution.solutions.map(function (sol) {
                return {
                    question_id: sol.question_id,
                    selected: sol.selected
                }
            });
            result.push({
                user: {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email
                },
                date_submitted: solution.date_submitted,
                solutions: formattedSolutions
            });
        } catch (e) {
            console.log(e);
        }
    }
    return res.status(200).json(result);
});

exports.submitSolution = async(function (req, res, next) {
    var quizId = req.params.id;
    var userId = req.user.id;

    var solution = await(Solution.findOne({quiz_id: quizId, user_id: userId}));
    if (solution) {
        return next(new HttpError(403, 'User has already solved this quiz.'))
    }
    var solutionData = {
        quiz_id: quizId,
        user_id: userId,
        solutions: req.body
    };
    Solution.create(solutionData, function (err) {
        if (err) {
            return next(err);
        }
        return res.status(204).send();
    });
});