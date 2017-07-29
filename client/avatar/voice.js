export default class Voice {
    constructor(socketMessenger, socketController, expression, textOutput) {
        console.log("Voice constructed!")
        this.socketMessenger = socketMessenger;
        this.socketController = socketController;
        this.expression = expression;
        this.textOutput = textOutput;
    }
    init() {
        console.log("Init voice", this.textOutput);
        if (window.speechSynthesis) {
            this.voices = window.speechSynthesis.getVoices();
            console.log("initial voices", this.voices);
        }
        this.socketMessenger.on('speech',(data) => {
            console.log("Speech!", data)
            this.textOutput.html(data.text);
            /*
            responsiveVoice.speak(data.text, data.voice, {
                pitch: data.pitch,
                rate: 1.0,
                onstart: () => this.voiceStart(),
                onend: () => this.voiceEnd()
            });*/

            this.expressText = data.text;

            // Speech Synthesis API
            let utterThis = new SpeechSynthesisUtterance(data.text);
            utterThis.pitch = data.pitch;
            //            utterThis.voice = this.voices[5];
            utterThis.rate = 0.7;
            utterThis.onend = () => this.voiceEnd();
            utterThis.onstart = () => this.voiceStart();
            utterThis.onboundary = (event) => this.voiceBoundary(event);
            window.speechSynthesis.speak(utterThis);
            /*
            utterThis.onboundary = function(event) {
                console.log(event.name + ' boundary reached after ' + event.elapsedTime + ' milliseconds.');
              }*/

        });
    }

    voiceStart() {
        // Speaking movement
        events.emit("voice_start");
        this.expression.applyPoseByName("Speaking");
        this.textOutput.fadeIn();
    }

    voiceBoundary(event) {
        console.log(event.name + ' boundary reached after ' + event.elapsedTime + ' milliseconds.');
    }

    voiceEnd() {
        events.emit("voice_end");
        this.textOutput.fadeOut();
        this.expression.express(this.expressText);
    }
}
