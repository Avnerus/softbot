import express from 'express';
import bodyParser from 'body-parser'
import _ from 'lodash';
import fs from 'fs';
import {Server} from 'http'
import textToSpeech from '@google-cloud/text-to-speech'
import webpack from 'webpack'
import webpackConfig from '../webpack.config'
import WebpackMiddleware from 'webpack-dev-middleware'

import * as MSTTS from './ms-tts' 
import * as GoogleTranslate from './google-translate'

//import Signaling from './signaling'

const options = {
    key: fs.readFileSync('./server/ssl/server.key'),
    cert: fs.readFileSync('./server/ssl/server.crt')
};
const app = express();
//const server = require('https').Server(options, app);
const server = Server(app);

/*
const signaling = new Signaling(io);
signaling.init(); */

app.use(express.static('public'));

const compiler = webpack(webpackConfig);
app.use(
    WebpackMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath
    })
);

app.get('/api/google-speak',(req, res) => {
    const client = new textToSpeech.TextToSpeechClient();

    if (!req.query.text) {
        res.send(500,"Invalid request");
        return;
    }

    const request = {
      input: {text: req.query.text},
      voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
      audioConfig: {audioEncoding: 'MP3'},
    };
    // Performs the Text-to-Speech request
    client.synthesizeSpeech(request, (err, response) => {
        if (err) {
            console.log(err);
            res.send(500,err.toString());
            return;
        }
        res.set('Content-Type', 'audio/mpeg');
        res.send(response.audioContent);
    });
});
app.get('/api/ms-speak', async (req, res) => {
    try {
        if (!req.query.text) {
            res.send(500,"Invalid request");
            return;
        }
        let text = req.query.target ? await GoogleTranslate.translate(req.query.text, req.query.target) : req.query.text;
        console.log("Text ", text);
        let {bodyStream, headers} = await MSTTS.getSpeech(text, req.query.target);
        console.log("Response headers", headers);
        res.type("audio/mpeg");
        bodyStream.pipe(res);
    }
    catch (e) {
        console.log("Error", e);
        res.send("Error " + e);
    }
});

app.get('/api/stream', async (req, res) => {
    try {
        res.type("audio/mpeg");
        fs.createReadStream("public/test/speak.mpga").pipe(res);
    }
    catch (e) {
        console.log("Error", e);
        res.send("Error " + e);
    }
});

server.listen(3080, () => {
    console.log('listening on port 3080!');
});

