export default class JanusConnection {
    constructor(server) {
        console.log("JanusConnection constructed!");
        this.server = server;
    }
    init() {
        console.log("JanusConnection init");
        Janus.init({debug: "none", callback: () => {
            if(!Janus.isWebrtcSupported()) {
                throw "WebRTC Not supported!";
            }
            console.log("Initializing Janus");
            this.janus = new Janus(
                {
                    server: this.server,
                    success: () => {
                        console.log("Janus Init success! Attaching to streaming plugin");
                        events.emit("janus_connected", this.janus);
                    },
                    error: (error) => {
                        //Janus.error(error);
                        throw "Janus Error " + error;
                    },
                    destroyed: () => {
                        console.log("Janus Destroyed!");
                    }
                });
        }})
    }
}
