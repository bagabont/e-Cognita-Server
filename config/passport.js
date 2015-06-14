var User = require('../models/user'),
    BasicStrategy = require('passport-http').BasicStrategy,
    async = require('asyncawait/async'),
    await = require('asyncawait/await');

module.exports = function (passport) {
    var verifyAuth = async(function (email, password, done) {
        try {
            var user = await(User.findOne({email: email}));
            if (!user) {
                return done(null, false);
            }
            if (!user.checkPassword(password)) {
                return done(null, false);
            }
            return done(null, {id: user.id, email: user.email});
        }
        catch (err) {
            return done(err);
        }
    });

    passport.use(new BasicStrategy(verifyAuth));
};

