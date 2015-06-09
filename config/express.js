var bodyParser = require('body-parser');

module.exports = function (config, app, passport) {
    app.disable('x-powered-by');
    app.disable('etag');
    app.use(passport.initialize());

    // add body-parser middleware
    app.use(bodyParser.urlencoded({extended: false}));

    // require routes
    var users = require('../routes/users')();
    var courses = require('../routes/courses')(passport);
    var account = require('../routes/account')(passport);
    var quizzes = require('../routes/quizzes')(config, passport, bodyParser);

    // set API routers
    app.use('/api/', users);
    app.use('/api/', account);
    app.use('/api/', courses);
    app.use('/api/', quizzes);

    // error handler
    app.use(function (req, res, next) {
        res.status(404).send({status: 404, url: req.url});
    });

    // error handler
    app.use(function (err, req, res) {
        // do not expose error data in production
        var errorData = app.get('env') === 'development' ? err : {};
        res.status(err.statusCode || 500)
            .send({
                message: err.message,
                error: errorData
            });
    });
};