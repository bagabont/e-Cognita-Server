var User = require('../models/user'),
    HttpError = require('../components/http-error'),
    Solution = require('../models/solution'),
    Quiz = require('../models/quiz'),
    _ = require('underscore'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    Course = require('../models/course');

var evaluateQuizAvgScoreAsync = async(function (quiz) {
    var solutions = await(Solution.find({quiz_id: quiz.id}));
    var scores = [];
    _.each(solutions, function (sol) {
        scores.push(quiz.evaluateSolution(sol));
    });
    var sum = scores.reduce(function (a, b) {
        return a + b;
    });
    return (sum / scores.length);
});

var getProgressStatisticsAsync = async(function (user) {
    var results = [];
    // get all submissions of user
    var userSolutions = await(Solution.find({user_id: user.id}));

    for (var i = 0; i < userSolutions.length; i++) {
        var solution = userSolutions[i];

        // find quiz
        var quiz = await(Quiz.findById(solution.quiz_id));

        // evaluate statistics
        var userScore = quiz.evaluateSolution(solution);
        var avgScore = await(evaluateQuizAvgScoreAsync(quiz));
        results.push({
            quiz: {id: quiz.id, title: quiz.title},
            user_score: userScore,
            average_score: avgScore
        });
    }
    return results;
});


exports.getByType = async(function (req, res, next) {
    var type = req.params.stat_type;
    var user = await(User.findById(req.user.id));

    switch (type) {
        case 'avg':
            var result = await(getProgressStatisticsAsync(user));
            return res.json(result);

        default:
            return next(new HttpError(404, 'Unknown statistics type.'))
    }
});