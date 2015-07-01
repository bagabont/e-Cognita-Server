var router = require('express').Router(),
    UserController = require('../controllers/user');

module.exports = function () {
    router.route('/users')
        .post(UserController.register);

    return router;
};