function socketLogic(app, port) {
    // Socket IO init
    const server = app.listen(port, () => { console.log(`Server listen on port ${port}`) }); // Listening
    const io = require('socket.io').listen(server);

    // Application variables
    let raspberryConnected = false;

    io.on('connection', socket => {
        //User -> Server
        socket.on('raspberryStatus', data => {
            io.emit('raspberryStatus', { connected: raspberryConnected });
        });

        //Raspberry -> Server
        socket.on('welcomeRaspberry', data => {
            socket.name = 'raspberry';
            raspberryConnected = true;
            io.emit('raspberryStatus', { connected: raspberryConnected });
        });

        //Common
        socket.on('disconnect', () => {
            if (socket.name != 'raspberry') return;
            raspberryConnected = false;
            io.emit('raspberryStatus', { connected: raspberryConnected });
        })
    });
}