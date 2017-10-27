const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, index: { unique: true } },
    password: String
});

module.exports = mongoose.model('User', userSchema);