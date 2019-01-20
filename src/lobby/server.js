const uuid = require('uuid/v4')
const io = require('socket.io')({
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
});

const chatClient = require('../chat')

io.listen(3060);

// io.engine.clientsCount

const socketUsers = []

const chatClientInstance = chatClient(io)

// When a client connects, we note it in the console
io.sockets.on('connection', function (socket) {
    const socketUser = { socketId: uuid() }
    socketUsers.push(socketUser)

    console.log('Client connected!', io.engine.clientsCount, 'total clients')
    socket.emit('user_list', socketUsers.reduce((acc, current) => {
        if (current.id && acc.findIndex(i => i.id === current.id) === -1) {
            return [...acc, current]
        } else {
            return acc
        }
    }, []))

    socket.on('disconnect', () => {
        socketUsers.splice(socketUsers.findIndex(i => i.socketId === socketUser.socketId), 1)
        console.log('Client disconnected!')
        if (socketUser.id && socketUsers.findIndex(i => i.id === socketUser.id) === -1) {
            io.sockets.emit('user_left', { id: socketUser.id })
        }
    })

    socket.on('user_register', (data, callback) => {
        if (socketUser.id) {
            io.sockets.emit('user_left', { id: socketUser.id })
        }
        if (!data.id || !data.name) {
            callback(false)
            return
        }
        socketUser.id = data.id
        socketUser.name = data.name
        callback(true)
        console.log('registration:', data.id, data.name)
        io.sockets.emit('user_joined', { id: data.id, name: data.name })
    })

    chatClientInstance.handleSocket(socket)
});

console.log('Lobby server listening on port 3060')
