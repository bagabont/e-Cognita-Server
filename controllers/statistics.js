var User = require('../models/user'),
    HttpError = require('../components/http-error'),
    Solution = require('../models/submission'),
    Quiz = require('../models/quiz'),
    _ = require('underscore'),
    ScoreController = require('../controllers/score'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    Course = require('../models/course');

var getAverageAsync = async(function(quiz) {
    var scores = await(ScoreController.evaluateAllSubmissionsAsync(quiz));
    var scoresSum = _
        .map(scores, function(score) {
            return score.score;
        })
        .reduce(function(a, b) {
            return a + b;
        });
    return {
        average: scoresSum / scores.length,
        total_solutions: scores.length
    };
});

var getAccountAvgComparisonAsync = async(function(user) {
    var results = [];
    // get all submissions of user
    var userSolutions = await(Solution.find({
        user_id: user.id
    }).exec());

    for (var i = 0; i < userSolutions.length; i++) {
        var solution = userSolutions[i];

        // find quiz
        var quiz = await(Quiz.findById(solution.quiz_id));

        // evaluate statistics
        var userScore = await(ScoreController.evaluateSubmissionAsync(solution));
        var quizStat = await(getAverageAsync(quiz));
        results.push({
            quiz: {
                id: quiz.id,
                title: quiz.title
            },
            user_score: userScore,
            average_score: quizStat.average,
            total_solutions: quizStat.total_solutions
        });
    }
    return results;
});

exports.getByTypeAsync = async(function(req, res, next) {
    var type = req.params.stat_type;
    var user = await(User.findById(req.user.id).exec());

    switch (type) {
        case 'avg':
            var result = await(getAccountAvgComparisonAsync(user));
            return res.json(result);

        default:
            return next(new HttpError(404, 'Unknown statistics type.'));
    }
});

exports.getGradeDistributionAsync = async(function(req, res, next) {
    var quizId = req.params.quiz_id;
    var quiz = await(Quiz.findById(quizId).exec());
    if (!quiz) {
        return next(new HttpError(404, 'Quiz not found.'));
    }
    var gradeDist = [];
    for (var i = 0; i < 10; i++) {
        gradeDist.push({
            score: i / 10,
            count: 0
        });
    }

    var scores = await(ScoreController.evaluateAllSubmissionsAsync(quiz));
    _.forEach(scores, function(score) {
        var grade = Math.floor(score.score * 10) / 10;
        var dist = _.find(gradeDist, function(gd) {
            return gd.score == grade;
        });
        dist.count++;
    });

    var data = {
        quiz_id: quiz.id,
        quiz_title: quiz.title,
        total_participants: scores.length,
        grade_distribution: gradeDist
    }

    return res.json(data);
});
