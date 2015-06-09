var router = require('express').Router(),
    Course = require('../models/course'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await');

module.exports = function (passport) {
    router.route('/courses')
        .all(passport.authenticate('basic', {session: false}))
        .get(async(function (req, res) {
            var courses = await(Course.find({}));
            var result = [];
            for (var i = 0; i < courses.length; i++) {
                var model = courses[i];
                result.push({id: model._id, title: model.title, description: model.description});
            }
            res.status(200).send(result);
        }))
        .post(async(function (req, res) {
            var title = req.body.title;
            var description = req.body.description;
            var author = req.user.id;

            // check if course with the same title already
            // exists in the databse
            var course = await(Course.findOne({title: title}));
            if (course) {
                return res.status(409).send('Course already exists!');
            }

            // create and save the new course
            course = new Course({title: title, description: description, author: author});
            await(course.save());
            console.log('Course ' + title + ' created!');
            res.status(201).send();
        }));

    router.route('/courses/:id')
        .all(passport.authenticate('basic', {session: false}))
        .get(async(function (req, res) {
            var course = await(Course.findOne({_id: req.params.id}));
            if (!course) {
                return res.status(404).send();
            }
            else {
                res.send({id: course._id, title: course.title, description: course.description});
            }
        }));

    return router;
};
