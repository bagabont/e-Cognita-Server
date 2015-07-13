var bodyParser = require('body-parser'),
    passport = require('passport'),
    authController = require('../controllers/auth');

module.exports = function(config, app) {
    // remove excess headers
    app.disable('x-powered-by');
    app.disable('etag');

    // add middleware
    app.use(passport.initialize());
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(bodyParser.json());

    // require routes
    var users = require('../routes/users')();
    var account = require('../routes/account')(authController);
    var courses = require('../routes/courses')(authController);
    var quizzes = require('../routes/quizzes')(authController);
    var statistics = require('../routes/statistics')(authController);

    // set API routers
    app.use('/api/', users);
    app.use('/api/', account);
    app.use('/api/', courses);
    app.use('/api/', quizzes);
    app.use('/api/', statistics);

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        err.url = req.url;
        next(err);
    });

    // development error handler
    // will print stack trace
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.send({
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stack traces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send({
            message: err.message,
            error: {}
        });
    });
};
