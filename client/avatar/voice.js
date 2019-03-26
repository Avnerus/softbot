import PitchShifter from './pitch-shifter'

export default class Voice {
    constructor(audioContext, socketController, expression, textOutput) {
        console.log("Voice constructed!")
        this.socketController = socketController;
        this.expression = expression;
        this.textOutput = textOutput;
        this.audioContext = audioContext;

        /*
        const pitchShifter = new PitchShifter(1.3, 0.5, 512);
        this.pitchShiftNode = this.audioContext.createScriptProcessor(512, 1, 1);
        this.pitchShiftNode.onaudioprocess = (e) => pitchShifter.onaudioprocess(e);
        this.pitchShiftNode.connect(this.audioContext.destination);
        console.log("Pitch shifter", this.pitchShiftNode);*/
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
            let uri  = '/api/ms-speak?text=' + data.text;
            //let uri  = '/api/stream';
            if (data.translate) {
                uri += '&target=' + data.translate;
            }
                /*
            let res = await fetch(uri);
            let blob = await res.blob()
            console.log("Blob", blob);
            let arraybuffer = await blobToArrayBuffer(blob);
            console.log("ArrayBuffer", arraybuffer);
            let source  = this.audioContext.createBufferSource();
            console.log("Decoding");
            this.audioContext.decodeAudioData(arraybuffer, (buffer) => {
                source.buffer = buffer;
                //source.connect(this.pitchShiftNode);
                source.connect(this.audioContext.destination);
                console.log("Decoded", source);
                source.start();
              },
              function(e){ console.log("Error with decoding audio data" + e.err); 
            });*/

            let speech  = document.createElement('audio');
            speech.type     = 'audio/mpeg';
            speech.src  = uri;
            let source = this.audioContext.createMediaElementSource(speech);
            source.connect(this.audioContext.destination);
            window.source = source;
            //source.connect(this.audioContext.destination);
            //source.start();
            speech.volume = 0;
            speech.play();
            window.speech = speech;

          });
            
    }

    voiceStart() {
        // Speaking movement
        events.emit("voice_start");
        let timeout = this.currentData.translate == "ja" ? 1000 : 0;
        setTimeout(() => {
            this.expression.applyPoseByName("Speaking");
            this.textOutput.fadeIn();
        },timeout);
    }

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
