function socketLogic(app, port) {
    // Socket IO init
    const server = app.listen(port, () => { console.log(`Server listen on port ${port}`) }); // Listening
    const io = require('socket.io').listen(server);

    // Application variables
    const trackUsers = new Set();
    const raspberryPassword = 'superSecretCode';
    const isNotRaspberry = data => (data.password != raspberryPassword) ? true : false;
    let raspberryConnected = false;
    let temperature = 20;
    let humidity = 70;

    // Make io accessible to router
    app.use((req, res, next) => {
        req.io = io;
        next();
    });

    io.on('connection', socket => {
        //User -> Server
        socket.on('raspberryStatus', data => {
            console.log(`rasp is ${raspberryConnected}`);
            io.emit('raspberryStatus', { connected: raspberryConnected });
        });

        socket.on('weatherData', data => {
            io.emit('weatherData', { temperature, humidity });
        })

        socket.on('setDeviceStatus', data => {
            console.log('2', data);
            socket.broadcast.to('raspberry').emit('setDeviceStatus', data);
        })

        socket.on('updateImage', data => {
            console.log('Image 2', data);
            socket.broadcast.to('raspberry').emit('updateImage', data);
        })

        socket.on('setLocation', locationData => {
            trackUsers.add(locationData.username);
            io.emit('userLocation', locationData);
            rules(locationData);
        })

        socket.on('startCapture', data => {
            console.log('video', 2);
            // socket.broadcast.to('raspberry').emit('startCapture', data);
            io.emit('startCapture', data);
        })

        socket.on('getCaptureStatus', data => {
            console.log('video', 2);
            // socket.broadcast.to('raspberry').emit('startCapture', data);
            io.emit('getCaptureStatus', data);
        })


        //Raspberry -> Server
        socket.on('welcomeRaspberry', data => {
            if (isNotRaspberry(data)) return;
            socket.name = 'raspberry';
            socket.join('raspberry');
            raspberryConnected = true;
            io.emit('raspberryStatus', { connected: raspberryConnected });
        });

        socket.on('errorMessage', error => {
            socket.name = 'raspberry';
            io.emit('errorMessage', { error });
        });

        socket.on('setWeatherData', data => {
            if (isNotRaspberry(data)) return;
            ({ temperature, humidity } = data);
            io.emit('weatherData', { temperature, humidity });
        })

        socket.on('deviceStatus', data => {
            if (isNotRaspberry(data)) return;
            console.log('4', data);
            const { deviceId, isEnabled } = data;
            io.emit('deviceStatus', { deviceId, isEnabled });
        })

        socket.on('imageStream', data => {
            console.log('video', 4);
            io.emit('imageStream', data);
        })

        socket.on('captrureStatus', data => {
            console.log('sent status', 2);
            io.emit('captrureStatus', data);
        })

        //Common
        socket.on('disconnect', () => {
            if (socket.name != 'raspberry') return;
            raspberryConnected = false;
            io.emit('raspberryStatus', { connected: raspberryConnected });
        })
    });

    function rules(locationData) {
        if (locationData.distance > 5) {
            socket.broadcast.to('raspberry').emit('setDeviceStatus', { deviceId: 1, isEnabled: true });
        }

        if (locationData.distance > 5 && temperature < 18) {
            socket.broadcast.to('raspberry').emit('setDeviceStatus', { deviceId: 2, isEnabled: true });
        }
    }
}

module.exports = socketLogic;