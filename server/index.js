import express from 'express';
import bodyParser from 'body-parser'
import _ from 'lodash';
import fs from 'fs';
import {Server} from 'http'
import textToSpeech from '@google-cloud/text-to-speech'
import speech from '@google-cloud/speech'
import webpack from 'webpack'
import webpackConfig from '../webpack.config'
import WebpackMiddleware from 'webpack-dev-middleware'
import WebpackHotMiddleware from 'webpack-hot-middleware'

import opus from 'node-opus'
import ogg from 'ogg'
import wav from 'wav'

import * as MSTTS from './ms-tts' 
import * as GoogleTranslate from './google-translate'
import * as Forms from './forms'
import * as Unsplash from './unsplash'

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
app.use(WebpackHotMiddleware(compiler));
app.use(bodyParser.json());

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
        fs.createReadStream("public/test/web-audio-speech.mpga").pipe(res);
    }
    catch (e) {
        console.log("Error", e);
        res.send("Error " + e);
    }
});

app.post('/transcribe', async function(req, res) {
    try {
        if (!req.query.model) {
            res.send(500,"Invalid request");
            return;
        }
        const file = fs.createReadStream(await Forms.getFile(req,'audio'));
        const opusDecodeStream = new opus.Decoder(48000, 2, 4800);
        const oggDecode = new ogg.Decoder();
        oggDecode.on('stream', function (stream) {
          let bufs = [];
          console.log("Got OGG stream");
          stream._readableState.highWaterMark = 1;
          opusDecodeStream.on('format', function (format) {
            console.log("Raw format:",format);
            const outputWavStream = new wav.Writer({
                sampleRate: format.sampleRate,
                channels: format.channels
            });
            //outputWavStream.setEncoding('base64');
            opusDecodeStream.pipe(outputWavStream);
            outputWavStream.on('data', (chunk) => {
                bufs.push(chunk);
            })
          });
          opusDecodeStream.on('end', function (e) {
            console.log("Finished writing!");
            const waveBuffer = Buffer.concat(bufs);
            const base64Wave = waveBuffer.toString('base64');
            const client = new speech.SpeechClient();
            const audio = {
              content: base64Wave,
            };
            const config = {
                enoding: 'LINEAR16', 
                languageCode: req.query.model,
                audioChannelCount: 2
            };
            const request = {
              audio: audio,
              config: config,
            };
            client
            .recognize(request)
            .then(async data => {
                const response = data[0];
                console.log(data);
                const transcription = response.results
                  .map(result => result.alternatives[0].transcript)
                  .join('\n');
                console.log(`Transcription: ${transcription}`);
                let returnData = {
                    "status": "success",
                    "transcription": transcription
                };
                if (req.query.translate && req.query.translate.length > 0) {
                    let translation = await GoogleTranslate.translate(transcription, req.query.translate);
                    console.log(`Translation: ${translation}`);
                    returnData.translation = translation;
                }
                res.send(returnData);
            })
            .catch(err => {
                console.error('ERROR:', err);
                res.status(500).send({status: "error", error: err.toString()});
            });  
          }); 
          opusDecodeStream.on('error', function (err) {
              console.log("Error decoding opus", err);
              res.status(500).send({status: "error", error: "Error decoding opus: " + err.toString()});
          });

          stream.pipe(opusDecodeStream);
        });

        oggDecode.on('error', function (err) {
            console.log("Error decoding ogg", err);
            res.status(500).send({status: "error", error: "Error decoding ogg: " + err.toString()});
        });

        file.pipe(oggDecode);
    }
    catch (err) {
        console.log(err);
        res.status(500).send({status: "error", error: err.toString()})
    }
})

app.get('/api/random-image', async (req, res) => {
    try {
        if (!req.query.key) {
            res.send(500,"Invalid request");
            return;
        }
        let {bodyStream, headers} = await Unsplash.getRandomImage(req.query.key, req.query.search);
        res.type(headers.get('content-type'));
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

