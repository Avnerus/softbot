import YoutubeIframe from 'youtube-iframe'

export default class YoutubePlayer {
    constructor(socketController, playerContainer) {
        this.playerContainer = playerContainer;
        this.socketController = socketController;
    }
    init() {
        console.log("Init youtube player", this.playerContainer);
        this.socketController.on('youtube',(data) => {
            if (data.stop && this.player) {
                this.stopVideo();

            } else if (typeof(data.volume) != 'undefined' && this.player) {
                console.log("Volume!", data.volume);
                this.player.setVolume(data.volume);
            } else if (typeof(data.visible) != 'undefined' && this.player) {
                if (data.visible) {
                    $("#youtube").css("height", "100vh");
                    $("#youtube").css("width", "100vw");
                    $("#youtube").css("z-index", "1");
                } else {
                    $("#youtube").css("height", "0");
                    $("#youtube").css("width", "0");
                    $("#youtube").css("z-index", "0");
                }
            }
            else if (data.id){
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
        this.stopVideo();
        if (this.YouTube) {
            this.player = new this.YouTube.Player(
                this.playerContainer,{
                height: '0',
                width: '0',
                videoId: id,
                events : {
                    onReady: () => {this.onPlayerReady()},
                    onStateChange: (e) => {this.onPlayerStateChange(e)}
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

    onPlayerStateChange(e) {
        console.log("Player state change:  " + e.data);
        if (e.data == 1) { // Playing
            this.player.setVolume(95);
        } else if (e.data == 0) { // Ended
            this.stopVideo();
        }
    }

    stopVideo() {
        console.log("Stop video!");
        if (this.player) {
            this.player.stopVideo();
            this.player.destroy();
            this.player = null;
        }
    }
}
