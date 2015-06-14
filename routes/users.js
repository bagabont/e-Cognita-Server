var router = require('express').Router(),
    validator = require('validator'),
    User = require('../models/user'),
    async = require('asyncawait/async'),
    HttpError = require('../components/http-error'),
    await = require('asyncawait/await');

module.exports = function () {
    router.route('/users')
        .post(async(function (req, res, next) {
            var email = req.body.email;
            var password = req.body.password;
            var firstName = req.body.firstname;
            var lastName = req.body.lastname;

            if (!validator.isEmail(email)) {
                return next(new HttpError(400, 'Invalid email.'));
            }
            if (!validator.isLength(password, 3)) {
                return next(new HttpError(400, 'Invalid password.'));

            }
            if (!validator.isLength(firstName, 1)) {
                return next(new HttpError(400, 'Invalid first name.'));
            }
            if (!validator.isLength(lastName, 1)) {
                return next(new HttpError(400, 'Invalid last name.'));
            }
            var user = await(User.findOne({email: email}));
            if (user) {
                return next(new HttpError(409, 'User already exists.'));
            }
            user = new User({
                email: email,
                password: password,
                firstName: firstName,
                lastName: lastName
            });
            await(user.save());

            res.status(201).json();
        }));

    return router;
};
