// Socket IO
const socket = require('socket.io-client')('http://localhost:5000');
// Request
const request = require('request');
const fs = require('fs');
// WebCam
const NodeWebcam = require("node-webcam");
const Webcam = NodeWebcam.create({ width: 256, height: 256, output: "jpeg", callbackReturn: 'base64' });

// Application variables
const password = 'superSecretCode';

console.log('Raspberry running ...');

let i = 0;
//functions
function webCamShot2() {
    console.log(`Στέλνω φωτογραφία ${++i}`);
    Webcam.capture("webcam", (error, image) => {
        if (error) { socket.emit('errorMessage', { error }); return }
        socket.emit('imageStream', { number: i, image });
    });
    setTimeout(webCamShot2, 2500);
}

function capture() {

    Webcam.capture("picture", function (err, data) {

        if (err) {

            throw err;

        }

        socket.emit('imageStream', { number: ++i, image:data });

        setTimeout(capture, 25);

    });

}

setTimeout(capture, 2000);