// Libraries 
const express = require('express');
const mainController = require('../controllers/main.server.controller.js');


// 
const mainRouter = express.Router();

//Router object
const Router = function () {

    mainRouter.route('/').get(mainController.login);
    mainRouter.route('/').post(mainController.authenticate);
    mainRouter.route('/logIn').get(mainController.loginForm);
    mainRouter.use(mainController.authMildware);
    mainRouter.route('/welcome').get(mainController.home);
    mainRouter.route('/upLoadImage/camera').post(mainController.camImageStore);
    mainRouter.route('/setHome').get(mainController.setHome);
    mainRouter.route('/setHome').post(mainController.updateHomeData);
    mainRouter.route('/track').get(mainController.trackUser);
    mainRouter.route('/track/map').get(mainController.trackUserMap);
    mainRouter.route('/track/map/simulate').get(mainController.trackUserSim);
    mainRouter.route('/canvas').get(mainController.canvas);

    return mainRouter;
}

module.exports = Router;