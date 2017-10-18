const request = require('request');
const fs = require('fs');

console.log(__dirname + '/spiderman.jpg');

var formData = {
    camimage: fs.createReadStream(__dirname + '/alex.jpg')
};

var auth = {
    'user': 'alex',
    'pass': 'alexinio'
}

request.post({ url: 'https://thesis.kantas.net/image', formData, auth }, function optionalCallback(err, httpResponse, body) {
    if (err) {
        return console.error('upload failed:', err);
    }
    console.log('Upload successful!  Server responded with:', body);
});