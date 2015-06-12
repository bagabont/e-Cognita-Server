var router = require('express').Router(),
    User = require('../models/user'),
    Course = require('../models/course'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await');

module.exports = function (passport) {

    router.route('/account/courses/created')
        .all(passport.authenticate('basic', {session: false}))
        .get(async(function (req, res) {
            var courses = await(Course.find({author: req.user.id}));
            var result = courses.map(function (model) {
                return {id: model._id, title: model.title, description: model.description};
            });
            res.status(200).send(result);
        }));

    router.route('/account/courses/enrolled')
        .all(passport.authenticate('basic', {session: false}))
        .get(async(function (req, res) {
            var user = await(User.findOne({_id: req.user.id}));
            var enrollments = user.enrollments;
            var courses = await(Course.find({_id: {$in: enrollments}}));
            var result = courses.map(function (model) {
                return {id: model._id, title: model.title, description: model.description};
            });
            res.status(200).send(result);
        }))
        .post(async(function (req, res) {
            var user = await(User.findOne({_id: req.user.id}));
            var index = user.enrollments.indexOf(courseId);
            if (index > -1) {
                user.enrollments.push(req.body.course_id);
                await(user.save());
                return res.status(204).send();
            }
            else {
                return res.status(400).send('User is already enrolled in that course.');
            }
        }));

    router.route('/account/courses/enrolled/:id')
        .all(passport.authenticate('basic', {session: false}))
        .delete(async(function (req, res) {
            var user = await(User.findOne({_id: req.user.id}));
            var courseId = req.params.id;
            var index = user.enrollments.indexOf(courseId);
            if (index > -1) {
                user.enrollments.splice(index, 1);
                await(user.save());
                return res.status(204).send();
            }
            return res.status(404).send('User cannot leave a course he is not enrolled in.');
        }));

    router.route('/account/subscribe')
        .all(passport.authenticate('basic', {session: false}))
        .post(async(function (req, res) {
            var token = req.body.token;
            var user = await(User.findOne({_id: req.user.id}));
            user.pushToken = token;
            await(user.save());
            res.status(204).send();
        }))
        .delete(async(function (req, res) {
            var user = await(User.findOne({_id: req.user.id}));
            user.pushToken = undefined;
            await(user.save());
            res.status(204).send();
        }));

    return router;
};
