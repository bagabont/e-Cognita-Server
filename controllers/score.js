var Submission = require('../models/submission'),
    Quiz = require('../models/quiz'),
    HttpError = require('../components/http-error'),
    _ = require('underscore'),
    async = require('asyncawait/async'),
    User = require('../models/user'),
    await = require('asyncawait/await');

var getQuestionsStatAsync = async(function (quiz) {

    // create stats
    var stats = [];
    _.each(quiz.questions, function (question) {
        stats.push({
            question_id: question.id,
            question: question.question,
            correct_answers_count: 0,
            wrong_asnwers_count: 0,
            not_answered: 0
        });
    });

    // find all submissions
    var submissions = await(Submission.find({
        quiz_id: quiz.id
    }).exec());


    _.each(quiz.questions, function (q) {
        _.where()
    });

    return stats;
});

var evaluateSubmissionAsync = async(function (submission) {
    var quiz = await(Quiz.findById(submission.quiz_id));
    var totalQuestions = quiz.questions.length;

    // count correct answers
    var correctAnswers = quiz.questions.filter(function (question) {
        var answer = _.find(submission.solutions, function (solution) {
            return solution.question_id == question.id
        });
        if (!answer) {
            return false;
        }
        console.log('correct: ' + question.correct);
        console.log('selected: ' + answer.selected);
        return (question.correct == answer.selected);
    }).length;
    // return score
    return (correctAnswers / totalQuestions);
});

var evaluateAllSubmissionsAsync = async(function (quiz) {
    var submissions = await(Submission.find({
        quiz_id: quiz.id
    }).exec());
    var scores = [];
    _.each(submissions, function (submission) {
        // find user for this submission
        var user = await(User.findById(submission.user_id).exec());
        scores.push({
            user: {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
            },
            score: await(evaluateSubmissionAsync(submission))
        });
    });
    return scores;
});

var getUserScoresAsync = async(function (req, res, next) {
    var findOptions = {
        user_id: req.user.id
    };
    var submissions = await(Submission.find(findOptions).exec());
    if (!submissions) {
        return next(new HttpError(404, 'Submissions not found.'));
    }
    var scores = [];
    _.each(submissions, function (submission) {
        var quiz = await(Quiz.findById(submission.quiz_id));
        scores.push({
            quiz: {
                id: quiz.id,
                title: quiz.title
            },
            score: await(evaluateSubmissionAsync(submission))
        });
    });
    return res.json(scores);
});

var getUserScoreByQuizIdAsync = async(function (req, res, next) {
    var findOptions = {
        quiz_id: req.params.quiz_id,
        user_id: req.user.id
    };
    var submission = await(Submission.findOne(findOptions).exec());
    if (!submission) {
        return next(new HttpError(404, 'Submission not found.'));
    }
    return res.json({
        score: await(evaluateSubmissionAsync(submission))
    });
});

module.exports = {
    evaluateSubmissionAsync: evaluateSubmissionAsync,
    evaluateAllSubmissionsAsync: evaluateAllSubmissionsAsync,
    getUserScoresAsync: getUserScoresAsync,
    getUserScoreByQuizIdAsync: getUserScoreByQuizIdAsync
};
