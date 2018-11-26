// For messaging
import SocketClient from 'socket.io-client'

export default class SocketMessenger {
    constructor(registerCommand) {
        console.log("Socket messenger constructed!")
        this.host = document.location.host;
        this.registerCommand = registerCommand;
    }
    init() {
        //let host = document.location.host;
        console.log("Initializing socket io client to " + this.host);
        this.socket = new SocketClient(this.host);
        this.socket.on('connect', () => {this.onConnect();})
        this.socket.open();
    }
    onConnect() {
        console.log("Socket Messenger connected!");
        this.socket.emit(this.registerCommand);
    }
    emit(event, args) {
        console.log("Sending event " +  event);
        if (this.socket) {
            this.socket.emit(event, args, (data) => {
                console.log("Reply", data);
            });
        }
    }
    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }
}
