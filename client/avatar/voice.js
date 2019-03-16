export default class Voice {
    constructor(socketController, expression, textOutput) {
        console.log("Voice constructed!")
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
        this.socketController.on('speech',(data) => {
            console.log("Speech!", data)
            this.textOutput.html(data.text);
            this.currentData = data;
            responsiveVoice.speak(data.text);
            // For now use responsiveVoice only for Japanese
            /* if (data.translate != "en" && data.translate != "-") {
                responsiveVoice.speak(data.text, data.voice, {
                    pitch: data.pitch,
                    rate: 0.8,
                    onstart: () => this.voiceStart(),
                    onend: () => this.voiceEnd()
                });
             }
               
            else {
                // Speech Synthesis API
                let utterThis = new SpeechSynthesisUtterance(data.text);
                utterThis.pitch = data.pitch;
                //            utterThis.voice = this.voices[5];
                utterThis.rate = 0.5;
                utterThis.onend = () => this.voiceEnd();
                utterThis.onstart = () => this.voiceStart();
                utterThis.onboundary = (event) => this.voiceBoundary(event);
                window.speechSynthesis.speak(utterThis);
            }*/
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
