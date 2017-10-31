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
let captureActive = false;

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

        socket.emit('imageStream', { camId: 2, dateStamp: Date.now(), image: data });

        if (captureActive) setTimeout(capture, 25);

    });

}

socket.on('startCapture', (data) => {
    console.log('video',3);
    if(captureActive) return;
    captureActive = true;
    capture();
    setTimeout(() => {
        captureActive = false;
        console.log('sent status',1);
        socket.emit('captrureStatus', { camId: 2, captureStatus: false })
    }, 50000);
});

socket.on('getCaptureStatus',data=>{
    socket.emit('captrureStatus', { camId: 2, captureStatus: captureActive });
});