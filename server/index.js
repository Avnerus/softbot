import express from 'express'
import _ from 'lodash'
import fs from 'fs'
import Comm from './comm'
import {Server} from 'http'
import textToSpeech from '@google-cloud/text-to-speech'
import webpack from 'webpack'
import webpackConfig from '../webpack.config'
import WebpackMiddleware from 'webpack-dev-middleware'


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

app.get('/api/speak',(req, res) => {
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

server.listen(3080, () => {
    console.log('listening on port 3080!');
});

