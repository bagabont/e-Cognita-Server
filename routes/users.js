var router = require('express').Router(),
    validator = require('validator'),
    User = require('../models/user'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await');

module.exports = function () {

    router.route('/users')
        .post(async(function (req, res) {
            var email = req.body.email;
            var password = req.body.password;
            var firstName = req.body.firstname;
            var lastName = req.body.lastname;

            if (!validator.isEmail(email) || !validator.isLength(password, 3) || !validator.isLength(firstName, 1)) {
                res.status(400).send();
                return;
            }

            var user = await(User.findOne({email: email}));

            if (user) {
                res.status(409).send();
                return;
            }
            user = new User({
                email: email,
                password: password,
                firstName: firstName,
                lastName: lastName
            });
            await(user.save());
            res.status(201).send();
        }));

    return router;
};
