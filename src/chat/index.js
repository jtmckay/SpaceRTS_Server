module.exports = function (io) {
    const messages = []

    return {
        handleSocket: function (socket) {
            socket.on('chat_join', (channel, callback) => {
                socket.join('chat_message_list_' + channel);
                socket.join('chat_message_' + channel);
                socket.emit('chat_message_list_' + channel, messages)
            })
        
            socket.on('chat_leave', (channel, callback) => {
                socket.leave('chat_message_list_' + channel);
                socket.leave('chat_message_' + channel);
            })
        
            socket.on('chat_message', (channel, message, callback) => {
                if (message.iam && message.iam.name && message.iam.id) {
                    const messageToSend = { name: message.iam.name, text: message.text }
                    messages.push(messageToSend)
                    io.sockets.emit('chat_message_' + channel, messageToSend)
                }
                while (messages.length > 50) {
                    messages.shift()
                }
            })
        }
    }
}
