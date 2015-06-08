var router = require('express').Router(),
    Quiz = require('../models/quiz');

module.exports = function (passport) {
    router.route('/quizzes')
        .all(passport.authenticate('basic', {session: false}))
        .get(function (req, res, next) {
            Quiz.find().exec(function (err, quizzes) {
                if (err) {
                    throw err;
                }
                var json = [];
                for (var i = 0; i < quizzes.length; i++) {
                    json.push(quizModelToJson(quizzes[i]));
                }
                res.status(200).send(json);
            })
        })
        .post(function (req, res, next) {
            var content = req.body;
            if (!content || !content.description || !content.questions) {
                return res.status(400).send();
            }
            var quiz = new Quiz(content);
            quiz.save(function (err) {
                if (err) {
                    throw err;
                }
                res.status(201).send();
            });
        });

    router.param('id', function (req, res, next, id) {
        Quiz.findOne({_id: id}).exec(function (err, model) {
            if (err) {
                return next(err);
            }
            req.quiz = model;
            next();
        });
    });

    router.route('/quizzes/:id')
        .get(function (req, res) {
            if (!req.quiz) {
                return res.status(404).send();
            } else {
                res.send(quizModelToJson(req.quiz));
            }
        });

    function quizModelToJson(model) {
        return {
            id: model._id,
            created: model.created,
            title: model.title,
            description: model.description,
            questions: model.questions
        }
    }
    return router;
};
