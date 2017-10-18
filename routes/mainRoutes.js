// Libraries 
const express = require('express');
const mainController = require('../controllers/main.server.controller.js');

// 
const mainRouter = express.Router();

//Router object
const Router = function () {

    mainRouter.use(mainController.dataPesistanceMildware);
    mainRouter.route('/').get(mainController.home);
    mainRouter.route('/upLoadImage/camera').post(mainController.camImageStore);
    mainRouter.route('/setHome').get(mainController.setHome);
    mainRouter.route('/setHome').post(mainController.updateHomeData);
    mainRouter.route('/track').get(mainController.trackUser);

    return mainRouter;
}

module.exports = Router;