var router = require('express').Router(),
    User = require('../models/user'),
    HttpError = require('../components/http-error'),
    Course = require('../models/course'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await');

module.exports = function (passport) {

    router.route('/account/authored')
        .all(passport.authenticate('basic', {session: false}))
        .get(async(function (req, res) {
            var courses = await(Course.find({author: req.user.id}));
            var result = courses.map(function (model) {
                return {id: model._id, title: model.title, description: model.description};
            });
            return res.status(200).json(result);
        }));

    router.route('/account/enrollments')
        .all(passport.authenticate('basic', {session: false}))
        .get(async(function (req, res) {
            // find user by id
            var user = await(User.findById(req.user.id));
            // find courses for which the user is enrolled
            var courses = await(Course.find({_id: {$in: user.enrollments}}));
            var result = courses.map(function (model) {
                return {id: model._id, title: model.title, description: model.description};
            });
            return res.status(200).json(result);
        }));

    router.route('/account/enrollments/:id')
        .all(passport.authenticate('basic', {session: false}))
        .post(async(function (req, res, next) {
            var courseId = req.params.id;
            var user = await(User.findOne({_id: req.user.id}));
            var index = user.enrollments.indexOf(courseId);
            if (index > -1) {
                return next(400, 'User is already enrolled in the course.');
            }
            else {
                user.enrollments.push(courseId);
                await(user.save());
                return res.status(204).json();
            }
        }))
        .delete(async(function (req, res) {
            var user = await(User.findOne({_id: req.user.id}));
            var courseId = req.params.id;
            var index = user.enrollments.indexOf(courseId);
            if (index > -1) {
                user.enrollments.splice(index, 1);
                await(user.save());
                return res.status(204).json();
            }
            return next(new HttpError(404, 'Course not found in enrollments list.'));
        }));

    router.route('/account/subscriptions/:token')
        .all(passport.authenticate('basic', {session: false}))
        .post(async(function (req, res) {
            var token = req.params.token;
            var user = await(User.findOne({_id: req.user.id}));
            user.pushToken = token;
            await(user.save());

            return res.status(204).json();
        }))
        .delete(async(function (req, res) {
            var user = await(User.findOne({_id: req.user.id}));
            user.pushToken = undefined;
            await(user.save());

            return res.status(204).json();
        }));

    return router;
};
