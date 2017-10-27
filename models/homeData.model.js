const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/thesis');
mongoose.Promise = require('bluebird');

const homeData = new mongoose.Schema({
    homeLocation: mongoose.Schema.Types.Mixed,
    lastCamImg: Date,
    lastWebcamImg: Date
});

module.exports = mongoose.model('homeData', homeData, 'homeData');