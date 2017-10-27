function socketLogic(app, port) {
    // Socket IO init
    const server = app.listen(port, () => { console.log(`Server listen on port ${port}`) }); // Listening
    const io = require('socket.io').listen(server);

    // Application variables
    const raspberryPassword = 'superSecretCode';
    const isNotRaspberry = data => (data.password != raspberryPassword) ? true : false;
    let raspberryConnected = false;
    let temperature = 20;
    let humidity = 70;
    let rules = () => true;

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
            io.emit('userLocation', locationData);
            if (rules(locationData)) console.log(rules());
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
            console.log(`Take and send image ${data.number}`);
            io.emit('newimage', data);
        })
        // let i = 0;
        // setInterval(()=>socket.emit('newimage', {number:i++,image:'hi'}),1000)

        //Common
        socket.on('disconnect', () => {
            if (socket.name != 'raspberry') return;
            raspberryConnected = false;
            io.emit('raspberryStatus', { connected: raspberryConnected });
        })
    });
}

module.exports = socketLogic;