// For real time communication
import WebSocket from 'reconnecting-websocket'

export default class SocketController {
    constructor(host) {
        console.log("Socket controller constructed!")
        this.host = host;
    }
    init() {
        //let host = document.location.host;
        console.log("Initializing socket client to " + this.host);
        this.socket = new WebSocket(this.host);
        this.socket.binaryType = "arraybuffer";
        this.socket.addEventListener('open', () => {this.onConnect()});
    }
    onConnect() {
        console.log("Socket connected!");
        events.emit("socket_connectd", this.socket);
    }
    emit(message, args) {
        console.log("Sending message ", message);
        if (this.socket) {
            this.socket.emit(message, args);
        }
    }

    send(message) {
        if (this.socket) {
            this.socket.send(message);
        }
    }

    sendValueCommand(command, ...values) {
        let buffer = new ArrayBuffer(3 + values.length);
        let z = new Uint8Array(buffer);
        z[0] = ">".charCodeAt(0);
        z[1] = command.charCodeAt(0); 
        z[2] = values.length;
        for (let i = 0; i < values.length; i++) {
            z[i + 3] = values[i];
        }
        console.log(z);
        this.send(buffer);
    }
}
