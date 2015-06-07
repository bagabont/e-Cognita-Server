var router = require('express').Router(),
    Course = require('../models/course');

module.exports = function (passport, bodyParser) {
    router.route('/courses')
        //.all(passport.authenticate('basic', {session: false}))
        .get(function (req, res, next) {
            Course.find({}, function (err, courses) {
                if (err) {
                    throw err;
                }
                var coursesJsonArray = [];
                for (var i = 0; i < courses.length; i++) {
                    coursesJsonArray.push(courseModelToJson(courses[i]));
                }
                res.status(200).send(coursesJsonArray);
            })
        })
        .post(function (req, res, next) {
            var title = req.body.title;
            var subTitle = req.body.subtitle;
            var description = req.body.description;

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
                    subTitle: subTitle,
                    description: description
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
            sub_title: model.subTitle,
            description: model.description
        }
    }

    return router;
};
