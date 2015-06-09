var router = require('express').Router(),
    Quiz = require('../models/quiz'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await');

module.exports = function (passport, bodyParser) {
    // add support for json content
    router.use(bodyParser.json());

    router.route('/quizzes')
        .all(passport.authenticate('basic', {session: false}))
        .get(async(function (req, res) {
            var quizzes = await(Quiz.find({}));
            var json = [];
            for (var i = 0; i < quizzes.length; i++) {
                var model = quizzes[i];
                json.push({
                    id: model._id,
                    created: model.created,
                    title: model.title,
                    description: model.description
                });
            }
            res.status(200).send(json);
        }))
        .post(function (req, res) {
            var content = req.body;
            if (!content || !content.title) {
                return res.status(400).send();
            }
            var quiz = new Quiz(content);
            await(quiz.save());

            res.status(201).send();
        });

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
            var quiz = req.quiz;
            for (var i = 0; i < quiz.questions.length; i++) {
                json.push(questionModelToJson(quiz.questions[i]));
            }
            res.send(json);
        }));


    function questionModelToJson(question) {
        return {
            id: question._id,
            text: question.text,
            answers: question.answers
        }
    }

    return router;
};
