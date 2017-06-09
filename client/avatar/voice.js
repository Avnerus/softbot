export default class Voice {
    constructor(socketMessenger, textOutput) {
        console.log("Voice constructed!")
        this.socketMessenger = socketMessenger;
        this.textOutput = textOutput;
    }
    init() {
        console.log("Init voice", this.textOutput);
        this.socketMessenger.on('speech',(data) => {
            console.log("Speech!", data)
            this.textOutput.html(data.text);
            this.textOutput.fadeIn();
            responsiveVoice.speak(data.text, data.voice, {pitch: data.pitch});
            setTimeout(() => {
                this.textOutput.fadeOut();
            },3000);
        });
    }
}
