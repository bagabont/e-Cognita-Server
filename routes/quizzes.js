var router = require('express').Router(),
    Quiz = require('../models/quiz'),
    User = require('../models/user'),
    QuizSolution = require('../models/quiz-solution'),
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
            var result = await(quizzes.map(function (quiz) {
                return quiz.toQuizJsonAsync();
            }));
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
                return next(new HttpError(400, 'No course with id: ' + courseId + '.'));
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
            try {
                var result = await(req.quiz.toQuizJsonAsync());
                return res.json(result);
            }
            catch (err) {
                next(err)
            }
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
            var answers = await(QuizSolution.find({quiz: quizId}));

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
                var quiz = req.quiz;
                var answers = req.body;

                for (var i = 0; i < answers.length; i++) {
                    var answer = answers[i];

                    for (var j = 0; j < quiz.questions.length; j++) {
                        var question = quiz.questions[j];

                        if (question.id == answer.question) {
                            answer.correct = question.correctAnswerIndex;
                        }
                    }
                }

                var solution = QuizSolution({
                    quiz: quiz.id,
                    author: req.user.id,
                    answers: answers
                });

                // save to DB
                await(solution.save());

                return res.status(204).json();
            }
        ))
    ;

    router.route('/quizzes/:id/publish/:overwrite')
        .all(passport.authenticate('basic', {session: false}))
        .post(async(function (req, res, next) {
            var quiz = req.quiz;
            var text = req.body.text;
            var overwrite = req.params.overwrite;

            var isPublished = quiz.datePublished !== undefined;
            if (isPublished && overwrite !== 'true') {
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
                var quiz = req.quiz;
                var results = [];
                var solutions = await(QuizSolution.find({quiz: quiz.id}));
                for (var i = 0; i < solutions.length; i++) {
                    var solution = solutions[i];
                    var user = await(User.findById(solution.author));
                    var result = {
                        user: user.toUserJson(),
                        correctAnswers: 0,
                        totalQuestions: 0
                    };
                    var answers = solution.answers;
                    for (var j = 0; j < answers.length; j++) {
                        result.totalQuestions++;
                        var answer = answers[j];
                        if (answer.choice === answer.correct) {
                            result.correctAnswers++;
                        }
                    }
                    results.push(result);
                }

                res.send(results);
            }
        ));

    return router;
}
;
