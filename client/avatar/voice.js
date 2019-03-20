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
            let speech  = document.createElement('audio');
            speech.type     = 'audio/mpeg';
            speech.src  = '/api/ms-speak?text=' + data.text;
            if (data.translate) {
                speech.src += '&target=' + data.translate;
            }
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
