var router = require('express').Router(),
    Quiz = require('../models/quiz'),
    Course = require('../models/course'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await');

module.exports = function (passport, bodyParser) {
    // add support for json content
    router.use(bodyParser.json());

    router.route('/quizzes')
        .all(passport.authenticate('basic', {session: false}))
        .get(async(function (req, res) {
            var courseId = req.query.course_id;

            var result = [];
            var quizModels;

            if (!courseId) {
                quizModels = await(Quiz.find());
            }
            else {
                quizModels = await(Quiz.find({course_id: courseId}));
            }

            for (var i = 0; i < quizModels.length; i++) {
                var quiz = quizModels[i];
                result.push({
                    id: quiz._id,
                    created: quiz.created,
                    course_id: quiz.course_id,
                    title: quiz.title,
                    description: quiz.description
                });
            }
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
            var json = [];
            var questions = req.quiz.questions;

            for (var i = 0; i < questions.length; i++) {
                var question = questions[i];
                json.push({id: question._id, text: question.text, answers: question.answers});
            }
            res.send(json);
        }));

    return router;
};