import Tone from 'tone'
import {CHAMBERS} from '../common/state'
import * as Hitodama from '../common/hitodama'

export default class Voice {
    constructor(audioContext, socketController, expression, textOutput) {
        console.log("Voice constructed!")
        this.socketController = socketController;
        this.expression = expression;
        this.textOutput = textOutput;
        this.audioContext = audioContext;
    }
    init() {
        console.log("Init voice", this.textOutput);
        /*
        if (window.speechSynthesis) {
            this.voices = window.speechSynthesis.getVoices();
            console.log("initial voices", this.voices);
        }*/
        this.socketController.on('speech', async (data) => {
            console.log("Speech!", data)
            this.textOutput.html(data.text);
            this.currentData = data;
            //let uri  = '/api/google-speak?text=' + data.text;
             let uri  = '/api/ms-speak?text=' + data.text;
            //let uri  = '/api/stream';
            if (data.translate) {
                uri += '&target=' + data.translate;
            }
            const player = new Tone.GrainPlayer({url: uri , detune: -250,  onload: () => {
                console.log("Buffer is loaded!");
                this.speakExpression();
                player.start();
            }}).toMaster();

        });
    }
    
    speakExpression() {
        Hitodama.inflateTo(
            this.socketController,
            CHAMBERS.MOUTH,
            0.8,
            800
        )
        .then(() => {
            return Hitodama.deflate(
                this.socketController,
                CHAMBERS.MOUTH,
                800
            )
        })
        .then(() => {
            return Hitodama.inflateTo(
                this.socketController,
                CHAMBERS.MOUTH,
                0.8,
                800
            )
        })
        .then(() => {
            return Hitodama.deflate(
                this.socketController,
                CHAMBERS.MOUTH,
            )
        });
    }


        /*
    voiceStart() {
        // Speaking movement
        events.emit("voice_start");
        let timeout = this.currentData.translate == "ja" ? 1000 : 0;
        setTimeout(() => {
            this.expression.applyPoseByName("Speaking");
            this.textOutput.fadeIn();
        },timeout);
    }*/

    voiceBoundary(event) {
        console.log(event.name + ' boundary reached after ' + event.elapsedTime + ' milliseconds.');
    }

    voiceEnd() {
        events.emit("voice_end");
        this.textOutput.fadeOut();
        this.expression.express(this.currentData.text);
    }
}
function blobToArrayBuffer(blob) {
	const fileReader = new FileReader();

	return new Promise((resolve, reject) => {
		fileReader.onload = () => resolve(fileReader.result);
		fileReader.onerror = reject;

		fileReader.readAsArrayBuffer(blob);
	});
};
