import _ from 'lodash'

export default class Transcript {
    constructor(socketMessenger, container) {
        console.log("Transcript constructed with container", container);
        this.socketMessenger = socketMessenger;
        this.container = container;
    }
    init() {
        this.socketMessenger.on('recognized-speech',(data) => {
            console.log("Recognized speech!", data)
            this.container.append('<div class="transcript-line">' + data.text + '</div>');
            responsiveVoice.speak(data.text, "UK English Female");
        });
    }
}
