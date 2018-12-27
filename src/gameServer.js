const io = require('socket.io')({
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
});

io.listen(3080);

// io.engine.clientsCount

// When a client connects, we note it in the console
io.sockets.on('connection', function (socket) {
    console.log('Client connected!', io.engine.clientsCount, 'clients');
    socket.on('disconnect', () => {
        console.log('Client disconnected!', io.engine.clientsCount, 'clients remaining');
    })
});

console.log('Game server listening on port 3080')
