var HttpError = require('../components/http-error'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    User = require('../models/user'),
    ObjectId = require('mongoose').Types.ObjectId,
    Course = require('../models/course');

function formatCourse(course, author) {
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
}

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
    Course.findOne({ title: courseData.title }, function (err, course) {
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

exports.getCourseById = async(function (req, res, next) {
    try {
        var courseId = req.params.id;
        if (!ObjectId.isValid(courseId)) {
            return next(new HttpError(400, 'Invalid course ID'));
        }
        var course = await(Course.findById(courseId).exec());
        if (!course) {
            return next(new HttpError(404, 'Course not found'));
        }
        var author = await(User.findById(course.author_id));
        return res.json(formatCourse(course, author));
    }
    catch (err) {
        return next(err);
    }
});