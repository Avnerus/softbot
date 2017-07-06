import config from './config'
import fs from 'fs'
import googleTranslate from 'node-google-translate-skidz'

export default class Comm {
    constructor(io) {
        console.log("Comm server constructed!")
        this.io = io;

        this.avatar = null;
        this.control = null;
    }
    init() {
        console.log("Comm server initalized");
        fs.open('./server/logs/comm.txt','a', (err,fd) => {
            if (err) {
                console.log("Error opening log file",err);
            } else {
                this.log = fd;
            }
        });;

        this.io.sockets.on('connection', (client) => {
            client.on('registerAvatar', () => {
                // TODO: Token
                if (!this.avatar) {
                    console.log("Client registered as avatar!");
                    this.avatar = client;
                } else {
                    console.log("Client tried to register as Avatar when there was already an Avatar!");
                }
            });
            client.on('registerControl', () => {
                // TODO: Token
                if (!this.control) {
                    console.log("Client registered as control!");
                    this.control = client;
                }
                else {
                    console.log("Client tried to register as Control when there was already a Control!");
                }
            });

            client.on('disconnect', () => {
                if (client == this.avatar) {
                    console.log("Avatar disconnected!");
                    this.avatar = null;
                }
                if (client == this.control) {
                    console.log("Control disconnected!");
                    this.control = null;
                }
            });

            client.on('speech', (data) => {
                if (client == this.control && this.avatar) {
                    this.speech(data).then((result) => {
                        console.log("Speech result");
                    });
                }
            })
            client.on('youtube', (data) => {
                if (client == this.control && this.avatar) {
                    this.avatar.emit('youtube', data);
                }
            })
        });
    }

    speech(data) {
        return new Promise((resolve, reject) => {
            // Should we translate to english?
            if (data.translate) {
                resolve(new Promise((resolve, reject) => {
                    googleTranslate({
                        text: data.text,
                        source: 'auto',
                        target: 'en'
                    }, (result) => {
                        console.log("Translate result: ", result)
                        resolve(result.translation);
                    });
                }));
            } else {
                resolve(data.text);
            }
        }).then((processedText) => {
            console.log("Processed text", processedText);
            data.text = processedText;
            this.avatar.emit('speech', data);
            fs.write(this.log, new Date() + " : " + data.text);
            return processedText;
        });
    }
};

