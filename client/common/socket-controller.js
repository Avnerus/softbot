// For real time communication
import WebSocket from 'reconnecting-websocket'

export default class SocketController {
    constructor(host) {
        console.log("Socket controller constructed!")
        this.host = host;
        this.prefixes = {};
    }
    init() {
        //let host = document.location.host;
        console.log("Initializing socket client to " + this.host);
        this.socket = new WebSocket(this.host);
        this.socket.binaryType = "arraybuffer";
        this.socket.addEventListener('open', () => {this.onConnect()});
        this.socket.addEventListener('message', (msg) => {this.onMessage(msg)});
    }
    onConnect() {
        console.log("Socket connected!");
        events.emit("socket_connected", this.socket);
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

    onMessage(msg) {
        console.log("Socket controller message: ", msg);
        let prefix = '';

        if (msg.data instanceof ArrayBuffer) {
            prefix = String.fromCharCode(new Uint8Array(msg.data,0,1)[0]);
            console.log("Array buffer prefix", prefix);
        }
        else {
            prefix = msg.data[0];
            console.log("String prefix: ", msg.data[0]);
        }
        if (this.prefixes[prefix]) {
            this.prefixes[prefix](msg.data);
        }
    }

    subscribeToPrefix(prefix, callback) {
        this.prefixes[prefix] = callback;        
    }

    sendSerialCommand(command, ...values) {
        console.log("Values", values);
        let buffer = new ArrayBuffer(3 + values.length);
        let z = new Uint8Array(buffer);
        z[0] = ">".charCodeAt(0);
        z[1] = command.charCodeAt(0); 
        z[2] = values.length;
        for (let i = 0; i < values.length; i++) {
            z[i + 3] = values[i];
        }
        this.send(buffer);
    }
    sendValueCommand(command, ...values) {
        console.log("Values", values);
        let buffer = new ArrayBuffer(1 + values.length);
        let z = new Uint8Array(buffer);
        z[0] = command.charCodeAt(0); 
        for (let i = 0; i < values.length; i++) {
            z[i + 1] = values[i];
        }
        this.send(buffer);
    }
}
