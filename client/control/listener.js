import Util from '../common/util'
import store, {addTranscript} from '../common/state'

export default class Listener {
    startRecognizing(data) {
        this.data = data;
        console.log("Start recognizing!", data)
        const audioStream = new MediaStream(data.stream.getAudioTracks());
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
        if (this.recorder) {
            this.recorder.stop();
        }
    }
    dataAvailable(e) {
        console.log("Recorder data available!", e);
        const query = "model=" + this.data.model + "&translate=" + this.data.translate;
        console.log("Query:",query);
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
            store.dispatch(addTranscript({
                from: "Speaker",
                text: text
            }));
        })
        .catch((err) => {
            console.log("Error posting blob", err);
            store.dispatch(addTranscript({
                from: "Error",
                text: err.error
            }));
        })
    }
}


