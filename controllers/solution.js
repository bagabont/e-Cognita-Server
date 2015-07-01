var _ = require('underscore'),
    Solution = require('solutions/quiz-solution');

function getSelection(question, answers) {
    var selection = _.find(answers, function (solution) {
        if (solution.question == question.id) {
            return solution;
        }
    });
    return selection ? selection.choice : null;
}

function getSolution(answers) {
    var self = this;
    var solutions = [];
    for (var i = 0; i < self.questions.length; i++) {
        var question = self.questions[i];
        solutions.push({
            text: question.text,
            answers: question.answers,
            correct: question.correctAnswerIndex,
            selected: getSelection(question, answers)
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
            solution: quiz.getSolution(userSolution.answers)
        });
    }
    res.send(results);
};

module.exports = {
    getSolutin: getSolution
};
