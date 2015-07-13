var router = require('express').Router(),
    UserController = require('../controllers/user');

module.exports = function() {
    router.route('/users')
        .get(UserController.listUsers)
        .post(UserController.register);

    return router;
};
