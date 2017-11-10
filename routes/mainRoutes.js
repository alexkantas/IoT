// Libraries 
const express = require('express');
const mainController = require('../controllers/main.server.controller.js');


// 
const mainRouter = express.Router();

//Router object
const Router = function () {

    mainRouter.route('/').get(mainController.login);
    mainRouter.route('/').post(mainController.authenticate);
    mainRouter.route('/links').get(mainController.links);
    mainRouter.route('/documentation').get(mainController.documentation);
    mainRouter.route('/logIn').get(mainController.loginForm);
    mainRouter.route('/logOut').get(mainController.logout);
    mainRouter.route('/register').get(mainController.registerForm);
    mainRouter.route('/register').post(mainController.register);
    mainRouter.route('/upLoadImage/camera').post(mainController.camImageStore);
    mainRouter.use(mainController.authMildware);
    mainRouter.route('/dashboard').get(mainController.home);
    mainRouter.route('/dashboard/simple').get(mainController.homeSimple);
    mainRouter.route('/setHome').get(mainController.setHome);
    mainRouter.route('/setHome').post(mainController.updateHomeData);
    mainRouter.route('/track').get(mainController.trackUser);
    mainRouter.route('/track/map').get(mainController.trackUserMap);
    mainRouter.route('/track/map/simulate').get(mainController.trackUserSim);
    mainRouter.route('/canvas').get(mainController.canvas);

    return mainRouter;
}

module.exports = Router;