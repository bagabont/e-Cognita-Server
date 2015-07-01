var router = require('express').Router(),
    CourseController = require('../controllers/course');

module.exports = function (authController) {
    router.route('/courses')
        .all(authController.isAuthenticated)
        .get(CourseController.listCourses)
        .post(CourseController.createCourse);

    router.route('/courses/:id')
        .all(authController.isAuthenticated)
        .get(CourseController.getCourseById);

    return router;
};