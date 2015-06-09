var router = require('express').Router(),
    validator = require('validator'),
    User = require('../models/user');

module.exports = function () {

    router.route('/users')
        .post(function (req, res, next) {
            var email = req.body.email;
            var password = req.body.password;
            var firstName = req.body.firstname;
            var lastName = req.body.lastname;

            if (!validator.isEmail(email) || !validator.isLength(password, 3) || !validator.isLength(firstName, 1)) {
                res.status(400).send();
                return;
            }

            User.findOne({email: email}, function (err, user) {
                if (err) {
                    throw err;
                }
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
                user.save(function (err) {
                    if (err) {
                        throw err;
                    }
                    res.status(201).send();
                });
            });
        });

    router.param('email', function (req, res, next, email) {
        if (!validator.isEmail(email)) {
            res.status(400).send();
            return;
        }

        User.findOne({email: email}, function (err, model) {
            if (err) {
                return next(err);
            }
            req.user = model;
            next();
        });
    });

    router.route('/users/:email')
        .get(function (req, res) {
            if (!req.user) {
                return res.status(404).send();
            } else {
                res.send(userModelToJson(req.user));
            }
        });

    function userModelToJson(model) {
        return {
            id: model._id,
            email: model.email,
            firstname: model.firstName,
            lastname: model.lastName
        };
    }

    return router;
};
