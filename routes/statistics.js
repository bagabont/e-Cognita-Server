var router = require('express').Router(),
    StatisticsController = require('../controllers/statistics');

module.exports = function() {
    router.route('/statistics/:quiz_id/grade_distribution')
        .get(StatisticsController.getGradeDistributionAsync);

    router.route('/statistics/:quiz_id/answers_distribution')
        .get(StatisticsController.getAnswersDistributionAsync);

    router.route('/statistics/:quiz_id/submissions_dates')
        .get(StatisticsController.getSubmissionDateStatsAsync);
    return router;
};
