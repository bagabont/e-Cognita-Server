var validator = require('validator'),
    HttpError = require('../components/http-error'),
    User = require('../models/user');

function validateRegisterUserRequest(requestBody) {
    var errors = [];
    if (!validator.isEmail(requestBody.email)) {
        errors.push('Invalid email.');
    }
    if (!validator.isLength(requestBody.password, 3)) {
        errors.push('Invalid password.');
    }
    if (!validator.isLength(requestBody.firstname, 1)) {
        errors.push('Invalid first name.');
    }
    if (!validator.isLength(requestBody.lastname, 1)) {
        errors.push('Invalid last name.');
    }
    if (errors.length > 0) {
        return {success: false, errors: errors.join()};
    }
    return {success: true, errors: null};
}

exports.register = function (req, res, next) {
    var requestBody = req.body;
    var result = validateRegisterUserRequest(requestBody);
    if (!result.success) {
        return next(new HttpError(400, result.errors))
    }
    User.findOne({email: requestBody.email}, function (err, user) {
        if (err) {
            return next(err);
        }
        if (user) {
            return next(new HttpError(409, 'Email: ' + requestBody.email + ', already registered.'));
        }
        var model = {
            email: requestBody.email,
            first_name: requestBody.firstname,
            last_name: requestBody.lastname,
            password: requestBody.password
        };
        User.create(model, function (err) {
            if (err) {
                return next(err);
            }
            return res.status(201).send();
        });
    });
};

exports.listUsers = function (req, res, next) {
    User.find({}, function (err, users) {
        if (err) {
            return next(err);
        }
        return res.json(users.map(function (user) {
            return {
                email: user.email,
                first_name: user.firstname,
                last_name: user.lastname,
                password: user.password
            }
        }));
    });
};