const mongoose = require('mongoose');
const db = mongoose.connection;
mongoose.connect('mongodb://localhost/thesis');
const homeData = require("./models/homeData.model.js");
mongoose.Promise = require('bluebird');

db.on('error', console.error.bind(console, 'connection error:'));
console.log('Saving data ...');

/// Add the user data here
const user = new homeData({
    homeLocation: { lat: 25.320981, lng: 25.102705 },
    lastCamImg: Date.now(),
    lastWebcamImg: Date.now()
});

user.save().then(p => console.log(`Data ${JSON.stringify(p)} saved !!!`)).catch(err => console.log('Error' + err));