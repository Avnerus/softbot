import Util from '../common/util'

export default class Listener {
    constructor(socketMessenger, container, streamer) {
        console.log("Listener constructed with container", container);
        this.container = container;
        this.socketMessenger = socketMessenger;
        this.streamer = streamer;
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
        console.log("Start recognizing!", this.streamer.stream)
        let form = $(event.currentTarget).parent();
        this.container.find('#start-recognize-button').hide();
        this.container.find('#stop-recognize-button').show();
        events.emit("transcript", {from: "System", text: "Started Listening..."});

        const audioStream = new MediaStream(this.streamer.stream.getAudioTracks());
        let options = {mimeType: 'audio/ogg; codecs=opus'}
        this.recorder = new MediaRecorder(audioStream);
        this.recorder.start();
        this.recorder.ondataavailable = (e) => this.dataAvailable(e);
        console.log(this.recorder);

        /*
        this.socketMessenger.emit("recognize", {
            start: true,
            model: form.find('#recognize-model').val(),
            translate: form.find('#recognize-translate').val()
        });*/
    }

    stopRecognizing() {
        console.log("Stop recognizing!");
        this.recorder.stop();
        this.container.find('#stop-recognize-button').hide();
        this.container.find('#start-recognize-button').show();
        events.emit("transcript", {from: "System", text: "Stopped Listening..."});


        //this.socketMessenger.emit("recognize", {stop: true});
    }

    dataAvailable(e) {
        console.log("Recorder data available!", e);
        // Post the blob
        Util.postBlob(e.data, '/transcribe', 'audio')
        .then((response) => {
            console.log("Blob response: ", response);
        })
        .catch((err) => {
            console.log("Error posting blob", err);
            events.emit("transcript", {from: "Error", text: err.error});
        })
    }
}


