import express from 'express';
import socketio from 'socket.io'
import _ from 'lodash';
import fs from 'fs';
//import Signaling from './signaling'

const options = {
    key: fs.readFileSync('./server/ssl/server.key'),
    cert: fs.readFileSync('./server/ssl/server.crt')
};
const app = express();
//const server = require('https').Server(options, app);
const server = require('http').Server(app);
const io = socketio(server);

/*
const signaling = new Signaling(io);
signaling.init(); */


app.use(express.static('public'));

server.listen(3000, () => {
    console.log('listening on port 3000!');
});

