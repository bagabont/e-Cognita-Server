var User = require('../models/user'),
    passport = require('passport'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    BasicStrategy = require('passport-http').BasicStrategy;

passport.use(new BasicStrategy(
    function (username, password, callback) {
        User.findOne({email: username}, function (err, user) {
            if (err) {
                return callback(err);
            }
            if (!user) {
                return callback(null, false);
            }
            if (!user.checkPassword(password)) {
                return callback(null, false);
            }
            return callback(null, {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            });
        });
    }));

exports.isAuthenticated = passport.authenticate('basic', {session: false});
