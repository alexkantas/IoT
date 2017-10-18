// Socket IO
const socket = require('socket.io-client')('http://localhost:5000');
// Request
const request = require('request');
const fs = require('fs');
// WebCam
const NodeWebcam = require("node-webcam");
const Webcam = NodeWebcam.create({ width: 256, height: 256, output: "jpeg" });

// Application variables
const password = 'superSecretCode';
const devices = [
    {
        deviceId: 1,
        isEnabled: true,
        color: 'red'
    },
    {
        deviceId: 2,
        isEnabled: false,
        color: 'green'
    }
]

const cameras = [
    {
        camId: 1,
        dateStamp: 0,
        name: 'camera'
    },
    {
        camId: 2,
        dateStamp: 0,
        name: 'webcamera'
    },
]

console.log('Raspberry running ...');

//Sent Data
socket.emit('welcomeRaspberry', { password });


//Listening
socket.on('setDeviceStatus', data => {
    console.log('3', data);
    const devIndex = devices.findIndex(d => data.deviceId == d.deviceId);
    if (devIndex === -1) return;
    if (!data.justReport) devices[devIndex].isEnabled = data.isEnabled;
    const { deviceId, isEnabled } = devices[devIndex];
    console.log('Value changed!');
    socket.emit('deviceStatus', { password, deviceId, isEnabled });
});

socket.on('updateImage', data => {
    console.log('Image 3', data);
    const camIndex = cameras.findIndex(c => data.camId == c.camId);
    if (camIndex === -1) return;
    if (cameras[camIndex].name === 'webcamera') webCamShot(cameras[camIndex].camId)
});

//functions
function webCamShot(camId) {
    Webcam.capture("webcam", (error, data) => {
        if (error) { socket.emit('errorMessage', { error }); return }
        const formData = {webcamimage: fs.createReadStream(__dirname + '/webcam.jpg'),dateStamp:Date.now(),camId};
        request.post({ url: 'http://localhost:5000/upLoadImage/webCam', formData }, (error, httpRes, body) => {
            if (error) {
                socket.emit('errorMessage', { error });
                console.error('upload failed:', error);
                return;
            }
            console.log('Upload successful!  Server responded with:', body);
        });
    });
}