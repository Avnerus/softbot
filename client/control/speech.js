export default class Speech {
    constructor(socketMessenger, speechForm) {
        console.log("Speech constructed!")
        this.socketMessenger = socketMessenger;
        this.speechForm = speechForm;
    }
    init() {
        console.log("Init speech", this.speechForm);
        this.speechForm.submit((event) => {
            console.log("Say! ", event.currentTarget[0].value);
            this.socketMessenger.emit('speech', event.currentTarget[0].value);
            event.currentTarget[0].value = "";
            event.preventDefault();
        })
    }
}
