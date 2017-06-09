import YoutubeIframe from 'youtube-iframe'

export default class YoutubePlayer {
    constructor(socketMessenger, playerContainer) {
        this.playerContainer = playerContainer;
        this.socketMessenger = socketMessenger;
    }
    init() {
        console.log("Init youtube player", this.playerContainer);
        this.socketMessenger.on('youtube',(data) => {
            if (data.stop && this.player) {
                this.stopVideo();
            } else {
                this.playYoutube(data.id);
            }
        });

        YoutubeIframe.load((youtube) => {
            console.log("Loaded youtube iframe api", youtube);
            this.YouTube = youtube;
        })
    }

    playYoutube(id) {
        console.log("Play Youtube!", id);
        if (this.YouTube) {
            this.player = new this.YouTube.Player(
                this.playerContainer,{
                height: '390',
                width: '640',
                videoId: id,
                events : {
                    onReady: () => {this.onPlayerReady()},
                    onStateChange: () => {this.onPlayerStateChange()}
                }
               }
            );
            console.log(this.player);
        }
    }

    onPlayerReady() {
        console.log("Player ready!", this.player);
        this.player.playVideo();
    }

    onPlayerStateChange() {
        console.log("Player state change!")
    }

    stopVideo() {
        console.log("Stop video!");
        this.player.stopVideo();
        this.player.destroy();
    }
}
