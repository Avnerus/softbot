// For real time communication
import WebSocket from 'reconnecting-websocket'

export default class SocketController {
    constructor(host, connectCallback = null) {
        console.log("Socket controller constructed!")
        this.host = host;
        this.prefixes = {};
        this.commands = {};
        this.connectCallback = connectCallback;
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
        if (typeof(events) != 'undefined') {
            events.emit("socket_connected", this.socket);
        }
        if (this.connectCallback) {
            this.connectCallback();
        }
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
        // console.log("Socket controller message: ", msg);
        let prefix = '';

        if (msg.data instanceof ArrayBuffer) {
            prefix = String.fromCharCode(new Uint8Array(msg.data,0,1)[0]);
            //console.log("Array buffer prefix", prefix);

            if (prefix == 'C') {
                // Parse it
                let chars = new Uint16Array(msg.data, 2);
                let json = new TextDecoder("utf-16").decode(chars);
                console.log(json);
                let obj = JSON.parse(json);
                if (this.commands[obj.command]) {
                    this.commands[obj.command](obj);
                }
            }
            if (prefix == 'U') {
                // Parse it
                let chars = new Uint8Array(msg.data, 1);
                let json = new TextDecoder("utf-8").decode(chars);
                //console.log(json);
                let obj = JSON.parse(json);
                console.log(obj);
                if (this.commands[obj.command]) {
                    this.commands[obj.command](obj);
                }
            }
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
        console.log("Sending Serial command: ", command, values);
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
        console.log("Sending Value command ", command);
        let buffer = new ArrayBuffer(1 + values.length);
        let z = new Uint8Array(buffer);
        z[0] = command.charCodeAt(0); 
        for (let i = 0; i < values.length; i++) {
            z[i + 1] = values[i];
        }
        this.send(buffer);
    }

    sendJSONCommand(obj) {
        console.log("Send json command", obj);
        let text = JSON.stringify(obj);
        console.log("Text length " + text.length);
        let buffer = new ArrayBuffer(text.length * 2 + 2);
        console.log("buffer length " ,buffer);
        let command = new Uint8Array(buffer, 0);
        command[0] = 'C'.charCodeAt(0); 
        let bufView = new Uint16Array(buffer, 2);
        for (let i = 0; i < text.length; i++) {
            bufView[i] = text.charCodeAt(i);
        }
        this.send(buffer);
    }

    on(command, func) {
        this.commands[command] = func;
    }
    off(command) {
        if (this.commands[command]) {
            delete this.commands[command];
        }
    }
}
