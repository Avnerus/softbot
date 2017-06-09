export default class YoutubeRemote {
    constructor(socketMessenger, youtubeForm) {
        console.log("Remote youtub player constructed!")
        this.socketMessenger = socketMessenger;
        this.youtubeForm = youtubeForm;
    }
    init() {
        console.log("Init remote youtube", this.youtubeForm);
        /*
        this.youtubeForm.keydown((e) => {
            if (e.keyCode == 13) {
                this.youtubeForm.submit();
            }
        });*/
        this.youtubeForm.submit((event) => {
            console.log("Play youtube!! ", event.currentTarget[0].value);
            this.socketMessenger.emit('youtube', {
                id: event.currentTarget[0].value
            } );
            event.currentTarget[0].value = "";
            event.preventDefault();
        });
        this.youtubeForm.find('#stop-button').click(() => {
            this.socketMessenger.emit('youtube', {
                stop: true
            } );
        });
    }
}
