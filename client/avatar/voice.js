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
            this.textOutput.html(data);
            this.textOutput.fadeIn();
            responsiveVoice.speak(data, "Arabic Male", {pitch: 1});
            setTimeout(() => {
                this.textOutput.fadeOut();
            },3000);
        });
    }
}
