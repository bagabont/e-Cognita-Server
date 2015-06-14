var router = require('express').Router(),
    HttpError = require('../components/http-error'),
    Course = require('../models/course'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await');

module.exports = function (passport) {

    router.route('/courses')
        .all(passport.authenticate('basic', {session: false}))
        .get(async(function (req, res) {
            var courses = await(Course.find({}));
            var result = courses.map(function (course) {
                return {
                    id: course._id,
                    title: course.title,
                    description: course.description,
                    author: course.author
                };
            });
            return res.status(200).json(result);
        }))
        .post(async(function (req, res, next) {
            var title = req.body.title;
            var description = req.body.description;
            var author = req.user.id;

            // check if course with the same title already
            // exists in the database
            var course = await(Course.findOne({title: title}));
            if (course) {
                return next(new HttpError(409, 'Course with the same title already exists!'));
            }

            // create and save the new course
            course = new Course({
                title: title,
                description: description,
                author: author
            });
            await(course.save());

            res.status(201).json();
        }));

    router.route('/courses/:id')
        .all(passport.authenticate('basic', {session: false}))
        .get(async(function (req, res, next) {
            var course = await(Course.findById(req.params.id));
            if (!course) {
                return next(new HttpError(404, 'Course not found.'));
            }
            else {
                res.status(200).json({
                    id: course._id,
                    title: course.title,
                    description: course.description,
                    author: course.author
                });
            }
        }));

    return router;
};
