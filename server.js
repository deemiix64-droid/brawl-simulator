const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('.'));

let onlinePlayers = new Map();
let serverStartTime = Date.now();

io.on('connection', (socket) => {
    console.log('Новое подключение:', socket.id);
    onlinePlayers.set(socket.id, Date.now());
    io.emit('online_update', onlinePlayers.size);
    
    socket.on('disconnect', () => {
        onlinePlayers.delete(socket.id);
        io.emit('online_update', onlinePlayers.size);
    });
});

app.get('/api/stats', (req, res) => {
    res.json({
        online: onlinePlayers.size,
        uptime: Math.floor((Date.now() - serverStartTime) / 1000)
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
