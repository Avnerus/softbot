import EventEmitter from 'events'
import SocketMessenger from '../common/socket-messenger'
import SocketController  from '../common/socket-controller'
import Voice from './voice';
import YoutubePlayer from './youtube-player'
import Recognizer from './recognizer'
import Expression from '../common/expression'
import Idle from './idle'
import Keyboard from '../common/keyboard'

// WASM
import Breakout from '../common/breakout/breakout'

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
  //      this.socketMessenger.init();

        //this.socketController = new SocketController("ws://10.0.1.41:9540/ws");
        //this.socketController = new SocketController("ws://84.248.66.46:3012");
        this.socketController = new SocketController("ws://127.0.0.1:3012");
        events.on('socket_connected', () => {
            console.log("Socket connected registering avatar");
            this.socketController.sendValueCommand("R",1);
        })
        this.socketController.init();

        this.expression = new Expression(this.socketController);
        this.expression.init();

        this.recognizer = new Recognizer(
            this.socketMessenger, 
            this.socketController,
            this.expression, 
            $('#interface')
        );

        this.youtubePlayer = new YoutubePlayer(this.socketMessenger, 'player');
        this.youtubePlayer.init();


        this.voice = new Voice(
            this.socketMessenger,
            this.socketController,
            this.expression,
            $('#text-output')
        );
        this.voice.init();


        this.idle = new Idle(this.SocketController, this.expression);
     //   this.idle.init();


        /*
        this.rtcController = new RTCController();
        this.rtcController.init();*/

       this.keyboard = new Keyboard();
       this.keyboard.init();

       /*
       this.breakout = new Breakout($('#breakout'), this.keyboard);
       this.breakout.init();*/
    }


    start() {
        console.log("Avatar START");
        this.recognizer.init();
    }

    resize() {
        this.breakout.resize();
    }

}
