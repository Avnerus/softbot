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
        this.socket.emit(message, args);
    }

    send(message) {
        this.socket.send(message);
    }

    sendValueCommand(command, value) {
        var buffer = new ArrayBuffer(3);
        var z = new Uint8Array(buffer);
        z[0] = ">".charCodeAt(0);
        z[1] = command.charCodeAt(0); // PUMP
        z[2] = value;
        this.send(buffer);
    }
}
