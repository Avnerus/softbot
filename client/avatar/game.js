import EventEmitter from 'events'
import SocketMessenger from '../common/socket-messenger'
import Voice from './voice';
import YoutubePlayer from './youtube-player'

export default class  {
    constructor(config) {
        console.log("Game constructed!")
        this.config = config;
        this.started = true;
    }
    init() {
        class CustomEmitter extends EventEmitter {}
        this.emitter = new CustomEmitter();
        global.events = this.emitter;


        this.socketMessenger = new SocketMessenger('registerAvatar');
        this.socketMessenger.init();

        this.voice = new Voice(this.socketMessenger, $('#text-output'));
        this.voice.init();

        this.youtubePlayer = new YoutubePlayer(this.socketMessenger, 'player');
        this.youtubePlayer.init();

        /*
        this.rtcController = new RTCController();
        this.rtcController.init();*/
    }

    start() {
        this.resize();
    }

    animate(dt) {
        this.update(dt);
        this.render();
    }

    update(dt) {
    }

    render() {
    }

    resize() {
    }
}
