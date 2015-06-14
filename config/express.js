var bodyParser = require('body-parser');

module.exports = function (config, app, passport) {
    app.disable('x-powered-by');
    app.disable('etag');
    app.use(passport.initialize());

    // add body-parser middleware
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());

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

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    ////
    // error handlers
    /////

    // development error handler
    // will print stack trace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.send({
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stack traces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.send({
            message: err.message,
            error: {}
        });
    });
};