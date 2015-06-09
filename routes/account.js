var router = require('express').Router(),
    User = require('../models/user'),
    Course = require('../models/course'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await');

module.exports = function () {

    router.route('/account/courses/created')
        .all(passport.authenticate('basic', {session: false}))
        .get(async(function (req, res) {
            var courses = await(Course.find({author: req.user.id}));
            var result = [];
            for (var i = 0; i < courses.length; i++) {
                var model = courses[i];
                result.push({id: model._id, title: model.title, description: model.description});
            }
            res.status(200).send(result);
        }));

    router.route('/account/courses/enrolled')
        .all(passport.authenticate('basic', {session: false}))
        .get(async(function (req, res) {
            var user = await(User.findOne({_id: req.user.id}));
            var enrollments = user.enrollments;
            var courses = await(Course.find({_id: {$in: enrollments}}));
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

    router.route('/account/subscriptions')
        .post(async(function (req, res) {
            var user = await(User.findOne({_id: req.user.id}));
//TODO
            var enrollments = user.enrollments;
            res.status(201).send();
        }));

    return router;
};
