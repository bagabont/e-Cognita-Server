var HttpError = require('../components/http-error'),
    User = require('../models/user'),
    validator = require('validator'),
    Course = require('../models/course'),
    Solution = require('../models/solution'),
    Quiz = require('../models/quiz');

function formatQuiz(quiz) {
    return {
        id: quiz.id,
        date_created: quiz.date_created,
        title: quiz.title,
        course_id: quiz.course_id,
        description: quiz.description,
        date_due: quiz.date_due,
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
    Quiz.findById(id, function (err, quiz) {
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
        var now = new Date();
        // Check if quiz has due time.
        if (quiz.date_due && quiz.date_due > now) {
            return next(new HttpError(410, 'The quiz is no longer available.'));
        }
        var questions = quiz.questions;
        var result = questions.map(function (question) {
            return {id: question._id, text: question.text, answers: question.answers}
        });
        return res.status(200).json(result);
    });
};

exports.getSolutions = function (req, res, next) {
    var quizId = req.params.id;
    Solution.find({quiz: quizId}, function (err, solutions) {
        if (err) {
            return next(err);
        }
        var result = solutions.map(function (solution) {
            return {
                author: solution.author,
                created: solution.created,
                answers: solution.answers
            }
        });
        return res.status(200).json(result);
    });
};

exports.submitSolution = function (req, res, next) {
    var quizId = req.params.id;
    var solutionData = {
        quiz: quizId,
        author: req.user.id,
        answers: req.body
    };
    Solution.create(solutionData, function (err) {
        if (err) {
            return next(err);
        }
        return res.status(204).send();
    });
};