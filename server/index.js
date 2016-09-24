import express from 'express';
import socketio from 'socket.io'
import _ from 'lodash';

const app = express();
const server = require('http').Server(app);
const io = socketio(server);

app.use(express.static('public'));

server.listen(3000, function () {
      console.log('listening on port 3000!');
});
