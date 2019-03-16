import express from 'express';
import bodyParser from 'body-parser'
import _ from 'lodash';
import fs from 'fs';
import webpack from 'webpack'
import webpackConfig from '../webpack.config'
import WebpackMiddleware from 'webpack-dev-middleware'

import * as MSTTS from './ms-tts' 

//import Signaling from './signaling'

const options = {
    key: fs.readFileSync('./server/ssl/server.key'),
    cert: fs.readFileSync('./server/ssl/server.crt')
};
const app = express();
//const server = require('https').Server(options, app);
const server = require('http').Server(app);

/*
const signaling = new Signaling(io);
signaling.init(); */

app.use(express.static('public'));
app.use(express.static('public'));

const compiler = webpack(webpackConfig);
app.use(
    WebpackMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath
    })
);

// Watson token
/*
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
});*/
app.get('/api/ms-speech', async (req, res) => {
    try {
        let bodyStream = await MSTTS.getSpeech(req.query.text);
        res.type("audio/mpeg");
        bodyStream.pipe(res);
    }
    catch (e) {
        console.log("Error", e);
        res.send("Error " + e);
    }
});

server.listen(3080, () => {
    console.log('listening on port 3080!');
});

