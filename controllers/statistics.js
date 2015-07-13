var User = require('../models/user'),
    HttpError = require('../components/http-error'),
    Solution = require('../models/submission'),
    Quiz = require('../models/quiz'),
    _ = require('underscore'),
    ScoreController = require('../controllers/score'),
    Submission = require('../models/submission'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    Course = require('../models/course');

var getAverageAsync = async(function (quiz) {
    var scores = await(ScoreController.evaluateAllSubmissionsAsync(quiz));
    var scoresSum = _
        .map(scores, function (score) {
            return score.score;
        })
        .reduce(function (a, b) {
            return a + b;
        });
    return {
        average: scoresSum / scores.length,
        total_solutions: scores.length
    };
});


var getAccountPositionComparisonAsync = async(function () {
        // get all quizzes
        var quizzes = await(Quiz.find().exec());

        // compute scores for all quizzes
        var scores = [];
        _.each(quizzes, function (quiz) {
            var quizScores = await(ScoreController.evaluateAllSubmissionsAsync(quiz));
            scores.push(quizScores);
        });

        // flatten scores
        scores = _.chain(scores)
            .flatten()
            .groupBy(function (score) {
                return score.user.id;
            })
            .map(function (gr) {
                var score = _.chain(gr).reduce(function (memo, group) {
                    return memo + group.score;
                }, 0);

                return {
                    user: gr[0].user,
                    score: score / gr.length
                }
            });
        return scores;
    })
    ;

var getAccountAvgComparisonAsync = async(function (user) {
    var results = [];
    // get all submissions of user
    var userSolutions = await(Solution.find({user_id: user.id}).exec());

    for (var i = 0; i < userSolutions.length; i++) {
        var solution = userSolutions[i];

        // find quiz
        var quiz = await(Quiz.findById(solution.quiz_id).exec());

        // evaluate statistics
        var userScore = await(ScoreController.evaluateSubmissionAsync(solution));
        var quizStat = await(getAverageAsync(quiz));
        results.push({
            quiz: {id: quiz.id, title: quiz.title},
            user_score: userScore,
            average_score: quizStat.average,
            total_solutions: quizStat.total_solutions
        });
    }
    return results;
});

exports.getByTypeAsync = async(function (req, res, next) {
    var type = req.params.stat_type;
    var user = await(User.findById(req.user.id).exec());

    switch (type) {
        case 'avg':
            var result = await(getAccountAvgComparisonAsync(user));
            return res.json(result);
        case 'pos':
            var result = await(getAccountPositionComparisonAsync(user));
            return res.json(result);
        default:
            return next(new HttpError(404, 'Unknown statistics type.'));
    }
});

exports.getGradeDistributionAsync = async(function (req, res, next) {
    var quizId = req.params.quiz_id;
    var quiz = await(Quiz.findById(quizId).exec());
    if (!quiz) {
        return next(new HttpError(404, 'Quiz not found.'));
    }
    var gradeDist = [];
    for (var i = 0; i < 10; i++) {
        gradeDist.push({score: i / 10, count: 0});
    }

    var scores = await(ScoreController.evaluateAllSubmissionsAsync(quiz));
    _.forEach(scores, function (score) {
        var grade = Math.floor(score.score * 10) / 10;
        var dist = _.find(gradeDist, function (gd) {
            return gd.score == grade;
        });
        dist.count++;
    });

    var data = {
        quiz_id: quiz.id,
        quiz_title: quiz.title,
        total_participants: scores.length,
        grade_distribution: gradeDist
    };
    return res.json(data);
});

exports.getAnswersDistributionAsync = async(function (req, res, next) {
    var quizId = req.params.quiz_id;
    var quiz = await(Quiz.findById(quizId).exec());
    if (!quiz) {
        return next(new HttpError(404, 'Quiz not found.'));
    }
    var submissions = await(Submission.find({quiz_id: quizId}).exec());

    var data = {
        quiz_id: quiz.id,
        quiz_title: quiz.title,
        total_submissions: submissions.length,
        answers_distribution: []
    };

    // count correct answers
    _.each(quiz.questions, function (question) {

        var stat = {
            question: question.question,
            correct_answers_count: 0,
            wrong_answers_count: 0,
            not_answered_count: 0
        };
        data.answers_distribution.push(stat);

        _.each(submissions, function (submission) {
            // find answer for this question
            var answer = _.find(submission.solutions, function (solution) {
                return solution.question_id == question.id
            });

            if (!answer || answer.selected == -1) {
                stat.not_answered_count++;
                return;
            }

            if (question.correct == answer.selected) {
                stat.correct_answers_count++;
            }
            else {
                stat.wrong_answers_count++;
            }
        });
    });

    return res.json(data);
});

exports.getSubmissionDateStatsAsync = async(function (req, res, next) {
    var quizId = req.params.quiz_id;
    var quiz = await(Quiz.findById(quizId).exec());
    if (!quiz) {
        return next(new HttpError(404, 'Quiz not found.'));
    }
    var datePublished = quiz.date_published;
    if (!datePublished) {
        return next(new HttpError(400, 'Quiz is not published.'));
    }
    var submissions = await(Submission.find({quiz_id: quizId}).exec());
    var result = {
        quiz_id: quiz.id,
        quiz_title: quiz.title,
        date_published: datePublished,
        submissions: []
    };

    _.each(submissions, function (submission) {
        result.submissions.push({
            id: submission.id,
            date_submitted: submission.date_submitted
        });
    });
    return res.json(result);
});