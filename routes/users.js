var router = require('express').Router(),
    User = require('../models/user');

module.exports = function (passport) {
    router.route('/users')
        .post(function (req, res, next) {
            var email = req.query.email;
            var pass = req.query.pass;
            var firstName = req.query.firstname;
            var lastName = req.query.lastname;

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
                    password: pass,
                    firstName: firstName,
                    lastName: lastName
                });
                user.save(function (err) {
                    if (err) {
                        throw err;
                    }
                    console.log('Account created for ' + email + '!');
                    res.status(201).send();
                });
            });
        });

    router.param('id', function (req, res, next, id) {
        User.findOne({sid: id}, function (err, model) {
            if (err) {
                return next(err);
            }
            req.userModel = model;
            next();
        });
    });

    router.route('/users/:id')
        .get(function (req, res) {
            if (!req.userModel) {
                return res.status(404).send();
            } else {
                res.send(userModelToJson(req.userModel));
            }
        });

    function userModelToJson(model) {
        return {
            id: models._id,
            first_name: models.firstName,
            last_name: models.lastName
        };
    }

    return router;
};
