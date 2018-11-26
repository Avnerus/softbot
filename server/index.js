import express from 'express';
import socketio from 'socket.io'
import _ from 'lodash';
import fs from 'fs';
import Comm from './comm';
import watson from 'watson-developer-cloud';
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

const comm = new Comm(io);
comm.init();


app.use(express.static('public'));

// Watson token

app.get('/api/token',(req, res) => {
    let authorization = new watson.AuthorizationV1({
      username: 'f928b9d6-7bd0-4ad7-8c7e-67de63d94f9b',
      password: 'IgSspCBI5Yjx',
      url: watson.SpeechToTextV1.URL
    });
    authorization.getToken((err, token) => {
        if (!token) {
            res.send(err);
        } else {
            res.send(token);
        }
    })
});

server.listen(3080, () => {
    console.log('listening on port 3080!');
});

