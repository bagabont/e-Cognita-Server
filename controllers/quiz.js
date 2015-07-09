var HttpError = require('../components/http-error'),
    User = require('../models/user'),
    validator = require('validator'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    Course = require('../models/course'),
    Submission = require('../models/submission'),
    Quiz = require('../models/quiz'),
    _ = require('underscore'),
    gcm = require('node-gcm');

var env = process.env.NODE_ENV || 'development';
var config = config = require('../config/config')[env];
var gcmSender = new gcm.Sender(config.gcmApiKey);

function formatQuiz(quiz) {
    return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description || null,
        course_id: quiz.course_id,
        date_created: quiz.date_created || null,
        date_due: quiz.date_due || null,
        date_closed: quiz.date_closed || null,
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
        return { success: false, errors: errors.join() };
    }
    return { success: true, errors: null };
}

exports.listQuizzes = function (req, res, next) {
    var courseId = req.query.course_id;
    var options = courseId ? { course_id: courseId } : {};
    Quiz.find(options, function (err, quizzes) {
        if (err) {
            return next(err);
        }
        if (!quizzes) {
            return res.json([]);
        }
        return res.json(quizzes.map(function (quiz) {
            return formatQuiz(quiz)
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
            res.json(formatQuiz(quiz));
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
        // Check if quiz has due time.
        if (quiz.date_due && quiz.date_due > Date.now()) {
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
        User.find({ enrollments: quiz.course_id }, function (err, users) {
            if (err) {
                return next(err);
            }
            
            var gcmMessage = new gcm.Message();
            gcmMessage.addData('quiz_id', quiz.id);
            gcmMessage.addData('action', 'publish');
            gcmMessage.addData('message', message);
            
            
            var tokens = [];
            if (users && users.length > 0) {
                tokens = users.map(function (user) {
                    return user.push_token || '';
                });
            }
            
            gcmSender.send(gcmMessage, tokens, function (gcmError, result) {
                quiz.date_published = Date.now();
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

exports.closeQuizAsync = async(function (req, res, next) {
    var quiz = await(Quiz.findById(req.params.id).exec());
    if (!quiz) {
        return next(new HttpError(404, 'Quiz not found.'))
    }
    var message = req.body.message;
    var overwrite = req.query.overwrite;
    
    // check if quiz is already published
    if (quiz.isClosed() && overwrite !== 'true') {
        return next(new HttpError(403, 'Quiz is already closed.'));
    }
    
    // generate message
    var gcmMessage = new gcm.Message();
    gcmMessage.addData('quiz_id', quiz.id);
    gcmMessage.addData('action', 'close');
    gcmMessage.addData('message', message);
    
    // find enrolled users
    var users = await(User.find({ enrollments: quiz.course_id }));
    var tokens = [];
    if (users && users.length > 0) {
        tokens = users.map(function (user) {
            return user.push_token || '';
        });
    }
    
    gcmSender.send(gcmMessage, tokens, function (gcmError, result) {
        quiz.date_closed = Date.now();
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

exports.getUserQuizSolutionAsync = async(function (req, res, next) {
    var userId = req.user.id;
    var quizId = req.params.quiz_id;
    try {
        // get user solution
        var submission = await(Submission.findOne({ user_id: userId }));
        // get quiz
        var quiz = await(Quiz.findById(quizId));
        
        // populate results
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

exports.getQuizSolutionsAsync = async(function (req, res, next) {
    var submissions = await(Submission.find({ quiz_id: req.params.id }).exec());
    var result = [];
    _.each(submissions, function (submission) {
        var user = await(User.findById(submission.user_id).exec());
        
        var solutions = submission.solutions.map(function (solution) {
            return {
                question_id: solution.question_id,
                selected: solution.selected
            }
        });
        result.push({
            user: {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
            },
            date_submitted: submission.date_submitted,
            solutions: solutions
        });
    });
    return res.status(200).json(result);
});

exports.submitSolutionAsync = async(function (req, res, next) {
    var quizId = req.params.id;
    var userId = req.user.id;
    
    // check if quiz is closed
    var quiz = await(Quiz.findById(quizId));
    if (quiz.isClosed()) {
        return next(new HttpError(403, 'Quiz ' + quiz.title + ' is closed.'));
    }
    
    var solution = await(Submission.findOne({ quiz_id: quizId, user_id: userId }));
    if (solution) {
        return next(new HttpError(403, 'User has already solved this quiz.'))
    }
    var solutionData = {
        quiz_id: quizId,
        user_id: userId,
        solutions: req.body
    };
    Submission.create(solutionData, function (err) {
        if (err) {
            return next(err);
        }
        return res.status(204).send();
    });
});