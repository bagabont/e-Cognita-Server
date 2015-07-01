var HttpError = require('../components/http-error'),
    Course = require('../models/course');

function formatCourse(course) {
    return {
        id: course._id,
        date_created: course.dateCreated,
        author_id: course.authorId,
        title: course.title,
        description: course.description
    };
}

exports.listCourses = function (req, res, next) {
    Course.find({}, function (err, courses) {
        if (err) {
            return next(err);
        }
        if (!courses) {
            return res.json([]);
        }
        return res.json(courses.map(function (course) {
            return formatCourse(course);
        }));
    });
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