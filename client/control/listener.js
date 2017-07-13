export default class Listener {
    constructor(socketMessenger, container) {
        console.log("Listener constructed with container", container);
        this.container = container;
        this.socketMessenger = socketMessenger;
    }
    init() {
        console.log("Listener init");


        this.container.find('#start-recognize-button').click(() => {
            this.startRecognizing();
        });
        this.container.find('#stop-recognize-button').click(() => {
            this.stopRecognizing();
        });
    }

    startRecognizing() {
        console.log("Start recognizing!");
        this.container.find('#start-recognize-button').hide();
        this.container.find('#stop-recognize-button').show();
        events.emit("transcript", {from: "System", text: "Started Listening..."});
        this.socketMessenger.emit("recognize", {start: true});
    }

    stopRecognizing() {
        console.log("Stop recognizing!");
        this.container.find('#stop-recognize-button').hide();
        this.container.find('#start-recognize-button').show();
        events.emit("transcript", {from: "System", text: "Stopped Listening..."});
        this.socketMessenger.emit("recognize", {stop: true});
    }
}
