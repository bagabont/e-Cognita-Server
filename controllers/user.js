var validator = require('validator'),
    User = require('../models/user');

function validateUser(user) {
    var validationErrors = [];
    if (!validator.isEmail(user.email)) {
        validationErrors.push('Invalid email.');
    }
    if (!validator.isLength(user.password, 3)) {
        validationErrors.push('Invalid password.');
    }
    if (!validator.isLength(user.first_name, 1)) {
        validationErrors.push('Invalid first name.');
    }
    if (!validator.isLength(user.last_name, 1)) {
        validationErrors.push('Invalid last name.');
    }
    if (validationErrors.length > 0) {
        return {success: false, errors: validationErrors.join()};
    }
    return {success: true, errors: null};
}

exports.register = function (req, res, next) {
    var userData = req.body;
    var result = validateUser(userData);
    if (!result.success) {
        return next(new HttpError(400, result.errors))
    }
    User.findOne({email: userData.email}, function (err, user) {
        if (err) {
            return next(err);
        }
        if (user) {
            return next(new HttpError(409, 'Email: ' + userData.email + ', already registered.'));
        }
        User.create(userData, function (err) {
            if (err) {
                return next(err);
            }
            return res.status(201).send();
        });
    });
};