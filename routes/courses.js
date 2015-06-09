var router = require('express').Router(),
    Course = require('../models/course');

module.exports = function (passport) {
    router.route('/courses')
        .all(passport.authenticate('basic', {session: false}))
        .get(function (req, res) {
            Course.find({}, function (err, courses) {
                if (err) {
                    throw err;
                }
                var json = [];
                for (var i = 0; i < courses.length; i++) {
                    json.push(courseModelToJson(courses[i]));
                }
                res.status(200).send(json);
            })
        })
        .post(function (req, res) {
            var title = req.body.title;
            var description = req.body.description;
            var authorId = req.user.id;

            Course.findOne({title: title}, function (err, course) {
                if (err) {
                    throw err;
                }
                if (course) {
                    res.status(409).send();
                    return;
                }
                course = new Course({
                    title: title,
                    description: description,
                    authorId: authorId
                });
                course.save(function (err) {
                    if (err) {
                        throw err;
                    }
                    console.log('Course ' + title + ' created!');
                    res.status(201).send();
                });
            });
        });

    router.route('/courses/authored')
        .all(passport.authenticate('basic', {session: false}))
        .get(function (req, res) {
            Course.find({authorId: req.user.id}, function (err, courses) {
                if (err) {
                    throw err;
                }
                var json = [];
                for (var i = 0; i < courses.length; i++) {
                    json.push(courseModelToJson(courses[i]));
                }
                res.status(200).send(json);
            })
        });

    router.route('/courses/enrolled')
        .all(passport.authenticate('basic', {session: false}))
        .get(function (req, res) {
            Course.find({enrolledUsers: req.user.id}, function (err, courses) {
                if (err) {
                    throw err;
                }
                var json = [];
                for (var i = 0; i < courses.length; i++) {
                    json.push(courseModelToJson(courses[i]));
                }
                res.status(200).send(json);
            })
        })
        .post(function (req, res) {
            var courseId = req.query.id;
            var userId = req.user.id;
            Course.findOne({_id: courseId}, function (err, course) {
                if (err) {
                    throw err;
                }
                course.enrolledUsers.push(userId);
                course.save(function (err) {
                    if (err) {
                        throw err;
                    }
                    console.log('User ' + req.user.id + ' enrolled for ' + course.title + ' .');
                    res.status(204).send();
                });
            })
        });

    router.param('id', function (req, res, next, id) {
        Course.findOne({_id: id}, function (err, model) {
            if (err) {
                return next(err);
            }
            req.course = model;
            next();
        });
    });

    router.route('/courses/:id')
        .all(passport.authenticate('basic', {session: false}))
        .get(function (req, res) {
            if (!req.course) {
                return res.status(404).send();
            } else {
                res.send(courseModelToJson(req.course));
            }
        });


    function courseModelToJson(model) {
        return {
            id: model._id,
            title: model.title,
            description: model.description,
            authorId: model.authorId
        }
    }

    return router;
};
