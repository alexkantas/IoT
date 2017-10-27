const mongoose = require('mongoose');
const db = mongoose.connection;
mongoose.connect('mongodb://localhost/thesis');
const User = require("./models/user.model.js");
mongoose.Promise = require('bluebird');

db.on('error', console.error.bind(console, 'connection error:'));
console.log('Saving new user ...');

/// Add the user data here
const user = new User({
    username:'alex',
    password:'123'
});

user.save().then(p=>console.log(`User ${JSON.stringify(p)} saved !!!`)).catch(err=>console.log('Error'+err));