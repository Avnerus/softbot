import EventEmitter from 'events'
import SocketMessenger from '../common/socket-messenger'
import SocketController  from '../common/socket-controller'
import Voice from './voice';
import YoutubePlayer from './youtube-player'
import Recognizer from './recognizer'
import Expression from './expression'

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

        this.socketController = new SocketController("ws://10.0.1.41:9540/ws");
        this.socketController.init();

        this.recognizer = new Recognizer(this.socketMessenger, $('#recognizer-container'));
        this.recognizer.init();

        this.youtubePlayer = new YoutubePlayer(this.socketMessenger, 'player');
        this.youtubePlayer.init();

        this.expression = new Expression(this.socketController);
        this.expression.init();

        this.voice = new Voice(
            this.socketMessenger,
            this.socketController,
            this.expression,
            $('#text-output')
        );
        this.voice.init();


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
