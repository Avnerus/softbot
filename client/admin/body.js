export default class Body {
    constructor() {
        console.log("Body constructed!")
    }
    init() {
        console.log("Initalizing socket");
        events.on("socket_connected", (socket) => {
            this.socket = socket;
        })
    }
    emit(message, args) {
        console.log("Sending message ", message);
        this.socket.emit(message, args);
    }
    on(message, func) {
        this.socket.on(message, func);
    }
}
