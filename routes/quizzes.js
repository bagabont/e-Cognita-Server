var router = require('express').Router(),
    Quiz = require('../models/quiz'),
    Course = require('../models/course'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await');

module.exports = function (config, passport, bodyParser) {

    var messenger = require('../components/pusher')(config);

    // add support for json content
    router.use(bodyParser.json());

    router.route('/quizzes')
        .all(passport.authenticate('basic', {session: false}))
        .get(async(function (req, res) {
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
            res.status(200).send(result);
        }))
        .post(async(function (req, res) {
            var content = req.body;

            if (!content) {
                return res.status(400).send('Invalid or missing request content.');
            }

            if (!content.course_id) {
                return res.status(400).send('Invalid or missing course_id.');
            }

            // find course by id
            var courseId = content.course_id;
            var course = await(Course.findOne({_id: courseId}));

            if (!course) {
                return res.status(400).send('Cannot find course with id: ' + courseId + '.');
            }

            if (!content.title) {
                return res.status(400).send('Invalid or missing title.');
            }

            // create new quiz model
            var quiz = new Quiz(content);

            // save to DB
            await(quiz.save());

            res.status(201).send();
        }));

    router.param('id', async(function (req, res, next, id) {
        var quiz = await(Quiz.findOne({_id: id}));
        if (!quiz) {
            return res.status(404).send();
        }
        else {
            req.quiz = quiz;
            next();
        }
    }));

    router.route('/quizzes/:id')
        .get(async(function (req, res) {
            var model = req.quiz;
            res.send({
                id: model._id,
                created: model.created,
                title: model.title,
                description: model.description
            });
        }));

    router.route('/quizzes/:id/questions')
        .get(async(function (req, res) {
            var questions = req.quiz.questions;
            var result = questions.map(function (q) {
                return {id: q._id, text: q.text, answers: q.answers}
            });
            res.send(result);
        }));

    router.route('/quizzes/:id/publish')
        .post(async(function (req, res) {
            var quiz = req.quiz;
            var text = req.body.text;

            var isPublished = quiz.isPublished;
            if (isPublished) {
                return res.status(403).send('Quiz is already published.');
            }
            var result = await(messenger.sendAsync(quiz, text));
            if (result.success > 0) {
                quiz.isPublished = true;
                await(quiz.save());
                res.status(200).send(result);
            }
            else {
                res.status(503).send('No successful notifications.');
            }
        }));

    return router;
};
