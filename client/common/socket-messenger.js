// For messaging
import SocketClient from 'socket.io-client'

export default class SocketMessenger {
    constructor(host) {
        console.log("Socket messenger constructed!")
        this.host = document.location.host;
    }
    init() {
        //let host = document.location.host;
        console.log("Initializing socket io client to " + this.host);
        this.socket = new SocketClient(this.host);
        this.socket.on('connect', () => {this.onConnect();})
    }
    onConnect() {
        console.log("Socket Messenger connected!");
    }
    emit(message, args) {
        console.log("Sending message ", message);
        this.socket.emit(message, args);
    }
    send(message) {
        this.socket.send(message);
    }
}
