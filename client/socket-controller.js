export default class SocketController {
    constructor() {
        console.log("Socket controller constructed!")
    }
    init() {
        let host = document.location.host;
        this.socket = io(host);
    }
    emit(message, args) {
        console.log("Sending message ", message);
        this.socket.emit(message, args);
    }

    on(message, func) {
        this.socket.on(message, func);
    }
}
