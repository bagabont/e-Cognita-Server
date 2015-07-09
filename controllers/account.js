var User = require('../models/user'),
    HttpError = require('../components/http-error'),
    Quiz = require('../models/quiz'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    Course = require('../models/course');

exports.getAccount = async(function(req, res, next) {
    var user = await(User.findById(req.user.id).exec());
    return res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
    });
});

exports.deleteAccount = async(function(req, res, next) {
    await(User.findByIdAndRemove(req.user.id).exec());
    return res.status(204).send();
});

exports.listEnrolledCourses = async(function(req, res, next) {
    var user = await(User.findById(req.user.id).exec());
    if (!user) {
        return next(new HttpError(404, 'User not found!'));
    }
    // find courses for which the user is enrolled
    var courses = await(Course.find({
        _id: {
            $in: user.enrollments
        }
    }).exec());

    // no enrollments
    if (!courses) {
        return res.json([]);
    }
    var result = courses.map(function(course) {
        return {
            id: course._id,
            title: course.title,
            description: course.description
        };
    });
    return res.json(result);
});

exports.listAuthoredCourses = async(function(req, res, next) {
    var courses = await(Course.find({
        author_id: req.user.id
    }).exec());
    // no authored courses
    if (!courses) {
        return res.json([]);
    }
    var result = courses.map(function(course) {
        return {
            id: course._id,
            title: course.title,
            description: course.description
        };
    });
    return res.json(result);
});

exports.enroll = async(function(req, res, next) {
    var user = await((User.findById(req.user.id).exec()));
    if (!user) {
        return next(new HttpError(404, 'User not found!'));
    }
    var courseId = req.params.course_id;
    var index = user.enrollments.indexOf(courseId);
    if (index > -1) {
        return next(new HttpError(409, 'User is already enrolled in the course.'));
    } else {
        user.enrollments.push(courseId);
        await(user.save());
        return res.status(204).send();
    }
    return next(new HttpError(404, 'Course not found!'));
});

exports.drop = async(function(req, res, next) {
    var user = await(User.findById(req.user.id).exec());
    if (!user) {
        return next(new HttpError(404, 'User not found.'));
    }
    var courseId = req.params.course_id;
    var index = user.enrollments.indexOf(courseId);
    if (index > -1) {
        user.enrollments.splice(index, 1);
        await(user.save());
        return res.status(204).send();
    }
    return next(new HttpError(404, 'User is not enrolled for this course.'));
});

exports.subscribe = async(function(req, res, next) {
    var user = await(User.findById(req.user.id).exec());
    if (!user) {
        return next(new HttpError(404, 'User not found!'));
    }
    user.push_token = req.params.token;
    await(user.save());
    return res.status(204).send();
});

exports.unsubscribe = async(function(req, res, next) {
    var user = await(User.findById(req.user.id));
    if (!user) {
        return next(new HttpError(404, 'User not found!'));
    }
    user.push_token = undefined;
    await(user.save());
    return req.status(204).send();
});
