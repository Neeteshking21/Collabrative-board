const express = require('express');
const app = express();
const http = require('http');
const socket = require('socket.io');
/* Create Server */
const server = http.createServer(app);

/* Establish Socket Connection */
const io = socket(server);
io.on("connection", (socket) => {
    socket.on('drawing', (data) => {
        console.log(data)
         socket.broadcast.emit('drawing', data)
    })
})


const port = 9000;
server.listen(port, () => console.log(`server is running on http://localhots:${port}`));