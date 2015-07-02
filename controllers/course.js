var HttpError = require('../components/http-error'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    User = require('../models/user'),
    Course = require('../models/course');

var formatCourse = function (course, author) {
    return {
        id: course._id,
        date_created: course.date_created,
        title: course.title,
        description: course.description,
        author: {
            first_name: author.first_name,
            last_name: author.last_name,
            email: author.email
        }
    };
};

exports.listCourses = function (req, res, next) {
    Course.find({}, async(function (err, courses) {
        if (err) {
            return next(err);
        }
        if (!courses) {
            return res.json([]);
        }
        var result = await(courses.map(async(function (course) {
            var author = await(User.findById(course.author_id));
            return formatCourse(course, author);
        })));
        return res.json(result);
    }));
};

exports.createCourse = function (req, res, next) {
    var courseData = req.body;
    Course.findOne({title: courseData.title}, function (err, course) {
        if (err) {
            return next(err);
        }
        if (course) {
            return next(new HttpError(409, 'Course already exists.'));
        }
        // set course author
        courseData.author_id = req.user.id;
        Course.create(courseData, function (err, course) {
            if (err) {
                return next(err);
            }
            return res.json(formatCourse(course));
        });
    });
};

exports.getCourseById = function (req, res, next) {
    Course.findById(req.params.id, function (err, course) {
        if (err) {
            return next(err);
        }
        if (!course) {
            return next(new HttpError(404, 'Course not found'));
        }
        return res.json(formatCourse(course));
    });
};