import Util from '../common/util'
import store, {addTranscript} from '../common/state'

export default class Listener {
    startRecognizing(stream) {
        console.log("Start recognizing!", stream)
        const audioStream = new MediaStream(stream.getAudioTracks());
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
    }
    dataAvailable(e) {
        console.log("Recorder data available!", e);
        let query = this.container.find("form").serialize();
        console.log("Query", query);
        // Post the blob
        Util.postBlob(e.data, '/transcribe?' + query, 'audio')
        .then((response) => {
            console.log("Blob response: ", response);
            let text = "";
            if (response.translation) {
                text = response.translation + ' (' + response.transcription + ')';
            }
            else {
                text = response.transcription;
            }
            events.emit("transcript", {
                from: "Speaker",
                text: text
            })
        })
        .catch((err) => {
            console.log("Error posting blob", err);
            events.emit("transcript", {from: "Error", text: err.error});
        })
    }
}


