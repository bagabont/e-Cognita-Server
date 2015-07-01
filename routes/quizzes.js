var router = require('express').Router(),
    QuizSolution = require('../models/solution'),
    QuizController = require('../controllers/quiz');

module.exports = function (authController) {

    router.route('/quizzes')
        .all(authController.isAuthenticated)
        .get(QuizController.listQuizzes)
        .post(QuizController.createQuiz);

    router.route('/quizzes/:id')
        .all(authController.isAuthenticated)
        .get(QuizController.getQuizById);

    router.route('/quizzes/:id/publish')
        .all(authController.isAuthenticated)
        .post(QuizController.publishQuiz);

    router.route('/quizzes/:id/questions')
        .all(authController.isAuthenticated)
        .get(QuizController.getQuestions);

    router.route('/quizzes/:id/answers')
        .all(authController.isAuthenticated)
        .get(QuizController.getAnswers)
        .post(function (req, res, next) {
            var quiz = req.quiz;
            var answers = req.body;
            var solution = QuizSolution({
                quiz: quiz.id,
                author: req.user.id,
                answers: answers
            });
            // save to DB
            await(solution.save());
            return res.status(204).json();
        });
    return router;
};
