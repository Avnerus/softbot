export default class Listener {
    constructor(socketMessenger, container) {
        console.log("Listener constructed with container", container);
        this.container = container;
        this.socketMessenger = socketMessenger;
    }
    init() {
        console.log("Listener init");


        this.container.find('#start-recognize-button').click((event) => {
            this.startRecognizing(event);
        });
        this.container.find('#stop-recognize-button').click(() => {
            this.stopRecognizing();
        });
    }

    startRecognizing(event) {
        console.log("Start recognizing!")
        let form = $(event.currentTarget).parent();
        this.container.find('#start-recognize-button').hide();
        this.container.find('#stop-recognize-button').show();
        events.emit("transcript", {from: "System", text: "Started Listening..."});
        this.socketMessenger.emit("recognize", {
            start: true,
            model: form.find('#recognize-model').val(),
            translate: form.find('#recognize-translate').val()
        });
    }

    stopRecognizing() {
        console.log("Stop recognizing!");
        this.container.find('#stop-recognize-button').hide();
        this.container.find('#start-recognize-button').show();
        events.emit("transcript", {from: "System", text: "Stopped Listening..."});
        this.socketMessenger.emit("recognize", {stop: true});
    }
}
