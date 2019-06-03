import _ from 'lodash'
import RecordRTC from 'recordrtc' 

export default class Recorder {
    constructor(container) {
        console.log("Recorder constructed with container", container);
        this.container = container;
    }
    initWithStream(stream) {
        console.log("Recorder init with stream", stream);
        this.recorder = new RecordRTC(stream, {type: 'video'});

        this.container.find('#record-button').click(() => {
            this.startRecording();
        });
        this.container.find('#stop-button').click(() => {
            this.stopRecording();
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
}
