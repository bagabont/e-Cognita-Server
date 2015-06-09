var router = require('express').Router(),
    User = require('../models/user'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await');

module.exports = function () {
    router.route('/account/subscriptions')
        .post(async(function (req, res) {
            var user = await(User.findOne({_id: req.user.id}));
//TODO
            var enrollments = user.enrollments;
            res.status(201).send();
        }));

    return router;
};
