var router = require('express').Router(),
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

    router.route('/quizzes/:id/close')
        .all(authController.isAuthenticated)
        .post(QuizController.closeQuizAsync);

    router.route('/quizzes/:id/questions')
        .all(authController.isAuthenticated)
        .get(QuizController.getQuestions);

    router.route('/quizzes/:id/solutions')
        .all(authController.isAuthenticated)
        .get(QuizController.getQuizSolutionsAsync)
        .post(QuizController.submitSolutionAsync);

    return router;
};