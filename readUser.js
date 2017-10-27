// const mongoose = require('mongoose');
// const db = mongoose.connection;
// mongoose.connect('mongodb://localhost/thesis');
const User = require("./models/user.model.js");
// mongoose.Promise = require('bluebird');

let username = "Superman"
// db.on('error', console.error.bind(console, 'connection error:'));
console.log(`Readin user with username ${username} ...`);

User.findOne({ username })
.then(user => {
    console.log('Brhkame ton user!!');
    console.log(user);
})
.catch(err => console.log('Error' + err));