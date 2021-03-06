export default class YoutubeRemote {
    constructor(socketController, youtubeForm) {
        console.log("Remote youtub player constructed!")
        this.socketController = socketController;
        this.youtubeForm = youtubeForm;
    }
    init() {
        console.log("Init remote youtube", this.youtubeForm);
        this.youtubeForm.find( "#volume-slider" ).slider( {
            min:0,
            max:100,
            value: 100,
            slide: (event,ui) => {
                this.onVolumeChange(ui.value);
            },
        });
        this.youtubeForm.submit((event) => {
            console.log("Play youtube!! ", event.currentTarget[0].value);
            this.socketController.sendJSONCommand({
                command: 'youtube',
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


    onVolumeChange(value) {
        this.socketMessenger.emit('youtube', {
            volume: value
        });
    }
}
