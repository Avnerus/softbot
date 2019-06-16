import _ from 'lodash'
import RecordRTC from 'recordrtc' 

export default class Recorder {
    constructor(container) {
        console.log("Recorder constructed with container", container);
        this.container = container;
    }
    initWithStream(streaming, stream) {
        console.log("Recorder init with streaming", streaming);
        this.stream = stream;
        this.streaming = streaming;

        //this.recorder = new RecordRTC(stream, {type: 'video'});

        this.container.find('#record-button').click(() => {
            this.startRecordingJanus();
        });
        this.container.find('#stop-button').click(() => {
            this.stopRecordingJanus();
        });
    }

    startRecording() {
        console.log("Start recording!");
        this.recorder.startRecording();
    }

    stopRecording() {
        console.log("Stop recording!");
        this.recorder.stopRecording(() => {
            console.log("Recording stopped");
            let blob = this.recorder.blob;
            let url = URL.createObjectURL(blob);
            console.log(url);
        })
    }

    startRecordingJanus() {
        console.log("Start recording Janus!", this.streaming);
        const now = Date.now();
        var body = {
            "request": "recording",
            "action" : "start",
            "id" : 1,
            "video" : "/home/ubuntu/recordings/" + now + "_video",
            "audio" : "/home/ubuntu/recordings/" + now + "_audio",
            "secret": "PewDiePie"
        };
        this.streaming.send({"message": body});
    }

    stopRecordingJanus() {
        console.log("Stop recording Janus!", this.streaming);
        var body = {
            "request": "recording",
            "action" : "stop",
            "id" : 1,
            "video" : true,
            "audio" : true,
            "secret": "PewDiePie"
        };
        this.streaming.send({"message": body});
    }
}
