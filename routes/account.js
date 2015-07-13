var router = require('express').Router(),
    StatisticsController = require('../controllers/statistics'),
    QuizController = require('../controllers/quiz'),
    ScoreController = require('../controllers/score'),
    AccountController = require('../controllers/account');

module.exports = function(authController) {

    router.route('/account')
        .all(authController.isAuthenticated)
        .get(AccountController.getAccount)
        .delete(AccountController.deleteAccount);

    router.route('/account/authored')
        .all(authController.isAuthenticated)
        .get(AccountController.listAuthoredCourses);

    router.route('/account/enrolled')
        .all(authController.isAuthenticated)
        .get(AccountController.listEnrolledCourses);

    router.route('/account/enrolled/:course_id')
        .all(authController.isAuthenticated)
        .post(AccountController.enroll)
        .delete(AccountController.drop);

    router.route('/account/subscriptions/:token')
        .all(authController.isAuthenticated)
        .post(AccountController.subscribe)
        .delete(AccountController.unsubscribe);

    router.route('/account/solutions/:quiz_id')
        .all(authController.isAuthenticated)
        .get(QuizController.getUserQuizSolutionAsync);

    router.route('/account/statistics/:stat_type')
        .all(authController.isAuthenticated)
        .get(StatisticsController.getByTypeAsync);

    router.route('/account/scores')
        .all(authController.isAuthenticated)
        .get(ScoreController.getUserScoresAsync);

    router.route('/account/scores/:quiz_id')
        .all(authController.isAuthenticated)
        .get(ScoreController.getUserScoreByQuizIdAsync);
    return router;
};
