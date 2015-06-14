var router = require('express').Router(),
    Quiz = require('../models/quiz'),
    QuizAnswer = require('../models/quiz-answer'),
    HttpError = require('../components/http-error'),
    Course = require('../models/course'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await');

module.exports = function (config, passport) {

    var messenger = require('../components/pusher')(config);

    router.route('/quizzes')
        .all(passport.authenticate('basic', {session: false}))
        .get(async(function (req, res, next) {
            var courseId = req.query.course_id;
            var quizzes;
            if (!courseId) {
                quizzes = await(Quiz.find());
            }
            else {
                quizzes = await(Quiz.find({course_id: courseId}));
            }
            var result = quizzes.map(function (model) {
                return {
                    id: model._id,
                    created: model.created,
                    course_id: model.course_id,
                    title: model.title,
                    description: model.description
                }
            });
            return res.status(200).json(result);
        }))
        .post(async(function (req, res, next) {
            var content = req.body;
            if (!content) {
                return next(new HttpError(400, 'Invalid or missing request content.'));
            }
            if (!content.course_id) {
                return next(new HttpError(400, 'Invalid or missing course_id.'));
            }
            if (!content.title) {
                return next(new HttpError(400, 'Invalid or missing title.'));
            }
            var courseId = content.course_id;
            var course = await(Course.findById(courseId));
            if (!course) {
                return next(new HttpError(400, 'Cannot find course with id: ' + courseId + '.'));
            }
            var quiz = new Quiz(content);
            await(quiz.save());

            return res.status(201).json();
        }));

    router.param('id', async(function (req, res, next, id) {
        var quiz = await(Quiz.findById(id));
        if (!quiz) {
            return next(new HttpError(404, 'Quiz not found.'));
        }
        else {
            req.quiz = quiz;
            return next();
        }
    }));

    router.route('/quizzes/:id')
        .all(passport.authenticate('basic', {session: false}))
        .get(async(function (req, res, next) {
            res.json(req.quiz.getMinimalInfo());
        }));

    router.route('/quizzes/:id/questions')
        .all(passport.authenticate('basic', {session: false}))
        .get(async(function (req, res, next) {
            var quiz = req.quiz;
            // Check if quiz has due time.
            var now = new Date();
            if (quiz.due && quiz.due > now) {
                return next(new HttpError(410, 'The quiz is no longer available.'));
            }
            var questions = quiz.questions;
            var result = questions.map(function (question) {
                return {
                    id: question._id,
                    text: question.text,
                    answers: question.answers
                }
            });
            return res.status(200).json(result);
        }));

    router.route('/quizzes/:id/answers')
        .all(passport.authenticate('basic', {session: false}))
        .get(async(function (req, res, next) {
            var quizId = req.quiz.id;
            var answers = await(QuizAnswer.find({quiz: quizId}));

            var result = answers.map(function (answer) {
                return {
                    author: answer.author,
                    created: answer.created,
                    answers: answer.answers
                }
            });
            return res.status(200).json(result);
        }))
        .post(async(function (req, res, next) {
            var quizId = req.quiz.id;
            var content = req.body;
            var answer = QuizAnswer({
                quiz: quizId,
                author: req.user.id,
                answers: content
            });

            // save to DB
            await(answer.save());

            return res.status(204).json();
        }));

    router.route('/quizzes/:id/publish')
        .all(passport.authenticate('basic', {session: false}))
        .post(async(function (req, res, next) {
            var quiz = req.quiz;
            var text = req.body.text;

            var isPublished = quiz.datePublished === undefined;
            if (isPublished) {
                return next(new HttpError(403, 'Quiz is already published.'));
            }
            var result = await(messenger.sendAsync(quiz, text));
            if (result.success > 0) {
                quiz.datePublished = new Date();
                await(quiz.save());
                return res.status(200).json(result);
            }
            else {
                return next(new HttpError(503, 'No successful notifications.'));
            }
        }));

    router.route('/quizzes/:id/results')
        .all(passport.authenticate('basic', {session: false}))
        .get(async(function (req, res, next) {
                return res.status(501).json();
                
                //var quiz = req.quiz;
                //var questions = quiz.questions;
                //var userAnswers = await(QuizAnswer.find({quiz: quiz.id}));
                //var result = [];
                //
                //for (var i = 0; i < userAnswers.length; i++) {
                //    var score = 0;
                //    for (var j = 0; j < questions.length; j++) {
                //        var answer = userAnswers[i];
                //        var isCorrect = answer.choice === question[i].correctAnswerIndex;
                //        if (isCorrect) {
                //            score++;
                //        }
                //    }
                //}
            }
        ))
    ;

    return router;
}
;
