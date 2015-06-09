var router = require('express').Router(),
    Course = require('../models/course'),
    User = require('../models/user'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await');

module.exports = function (passport) {
    router.route('/courses')
        .all(passport.authenticate('basic', {session: false}))
        .get(async(function (req, res) {
            var courses = await(Course.find({}));
            var json = [];
            for (var i = 0; i < courses.length; i++) {
                var model = courses[i];
                json.push({id: model._id, title: model.title, description: model.description});
            }
            res.status(200).send(json);
        }))
        .post(async(function (req, res) {
            var title = req.body.title;
            var description = req.body.description;
            var authorId = req.user.id;

            var course = await(Course.findOne({title: title}));
            if (course) {
                res.status(409).send();
                return;
            }

            course = new Course({title: title, description: description, authorId: authorId});
            await(course.save());
            console.log('Course ' + title + ' created!');
            res.status(201).send();
        }));

    router.route('/courses/authored')
        .all(passport.authenticate('basic', {session: false}))
        .get(async(function (req, res) {
            var courses = await(Course.find({authorId: req.user.id}));
            var json = [];
            for (var i = 0; i < courses.length; i++) {
                var model = courses[i];
                json.push({id: model._id, title: model.title, description: model.description});
            }
            res.status(200).send(json);
        }));

    router.route('/courses/enrolled')
        .all(passport.authenticate('basic', {session: false}))
        .get(async(function (req, res) {
            var user = await(User.findOne({_id: req.user.id}));
            var courses = await(Course.find({id: user.enrollments}));
            var json = [];
            for (var i = 0; i < courses.length; i++) {
                var model = courses[i];
                json.push({id: model._id, title: model.title, description: model.description});
            }
            res.status(200).send(json);
        }))
        .post(async(function (req, res) {
            var user = await(User.findOne({_id: req.user.id}));
            user.enrollments.push(req.body.course_id);
            await(user.save());
            res.status(204).send();
        }));

    router.route('/courses/:id')
        .all(passport.authenticate('basic', {session: false}))
        .get(async(function (req, res) {
            var course = await(Course.findOne({_id: req.params.id}));
            if (!course) {
                return res.status(404).send();
            }
            else {
                res.send({
                    id: course._id,
                    title: course.title,
                    description: course.description,
                    quizzes: course.quizzes
                });
            }
        }));

    return router;
};
