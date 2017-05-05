import config from './config'

export default class Comm {
    constructor(io) {
        console.log("Comm server constructed!")
        this.io = io;

        this.avatar = null;
        this.control = null;
    }
    init() {
        console.log("Comm server initalized");
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
                    this.avatar.emit('speech', data);
                }
            })
        });
    }

};

