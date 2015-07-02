var _ = require('underscore'),
    Solution = require('solutions/quiz-solution');

function getSelection(question, choices) {
    var selection = _.find(choices, function (solution) {
        if (solution.question == question.id) {
            return solution;
        }
    });
    return selection ? selection.choice : null;
}

function getSolution(choices) {
    var self = this;
    var solutions = [];
    for (var i = 0; i < self.questions.length; i++) {
        var question = self.questions[i];
        solutions.push({
            question: question.question,
            choices: question.choices,
            correct: question.correct,
            selected: getSelection(question, choices)
        });
    }
    return solutions;
}

exports.getSolutionsByQuizId = function (req, res, next) {
    var quiz = req.quiz;
    var results = [];
    var solutions = await(QuizSolution.find({quiz: quiz.id}));

    for (var i = 0; i < solutions.length; i++) {
        var userSolution = solutions[i];
        var user = await(User.findById(userSolution.author));
        results.push({
            user: user.toUserJson(),
            solution: quiz.getSolution(userSolution.choices)
        });
    }
    res.send(results);
};