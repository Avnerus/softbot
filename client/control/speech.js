export default class Speech {
    constructor(socketMessenger, speechForm) {
        console.log("Speech constructed!")
        this.socketMessenger = socketMessenger;
        this.speechForm = speechForm;
    }
    init() {
        console.log("Init speech", this.speechForm);
        this.speechForm.keydown((e) => {
            if (e.keyCode == 13) {
                this.speechForm.submit();
            }
        });
        this.speechForm.submit((event) => {
            console.log("Say! ", event.currentTarget[0].value,event.currentTarget[1].value, event.currentTarget[2].value, event.currentTarget[3].checked);
            this.socketMessenger.emit('speech', {
                text: event.currentTarget[0].value,
                voice: event.currentTarget[1].value,
                pitch: event.currentTarget[2].value,
                translate: event.currentTarget[3].checked
            } );
            event.currentTarget[0].value = "";
            event.preventDefault();
        })
    }
}
