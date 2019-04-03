import EventEmitter from 'events'
//import SocketMessenger from '../common/socket-messenger'
import SocketController  from '../common/socket-controller'
import Voice from './voice';
import YoutubePlayer from './youtube-player'
//import Recognizer from './recognizer'
import Expression from '../common/expression'
import Idle from './idle'
import Keyboard from '../common/keyboard'
import GameController from './game-controller'
import Synth from './synth'
import Arms from './arms'

//import {greet} from '../common/breakout/breakout'

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


        /*
        this.socketMessenger = new SocketMessenger('registerAvatar');
        this.socketMessenger.init();*/

        //this.socketController = new SocketController("ws://10.0.1.41:9540/ws");
        //this.socketController = new SocketController("ws://84.248.66.46:3012");
        //this.socketController = new SocketController("ws://127.0.0.1:3012");
        this.socketController = new SocketController("ws://192.168.8.239:3012");
        events.on('socket_connected', () => {
            console.log("Socket connected registering avatar");
            this.socketController.sendValueCommand("R",1);
        })
        this.socketController.init();

        this.expression = new Expression(this.socketController);
        this.expression.init();

        /*
        this.recognizer = new Recognizer(
            this.socketController,
            this.expression, 
            $('#interface')
        );*/

        this.youtubePlayer = new YoutubePlayer(this.socketController, 'player');
        this.youtubePlayer.init();

        window.audio = this.audio = new (window.AudioContext || window.webkitAudioContext)();

        this.voice = new Voice(
            this.audio,
            this.socketController,
            this.expression,
            $('#text-output')
        );
        this.voice.init();


        this.idle = new Idle(this.socketController, this.expression);
     //   this.idle.init();


        /*
        this.rtcController = new RTCController();
        this.rtcController.init();*/

       this.keyboard = new Keyboard();
       this.keyboard.init();

       this.arms = new Arms(this.socketController);
       this.arms.init();

       this.gameController = new GameController(this.socketController, $('#breakout'), this.keyboard);
       this.gameController.init();

        
        $("#audio-test").click((e) => {
            e.preventDefault();
            console.log("Audio test!");
            $("#audio")[0].play();
        })

        this.synth = new Synth (this.audio, this.socketController);
        

       //greet("Bitch");

    }


    start() {
        console.log("Avatar START");
        /*
        this.recognizer.init();
        */

        this.socketController.subscribeToPrefix('E', (msg) => {
            console.warn("Error: ", msg.slice(1));
        });

        this.socketController.on('button-on', (data) => {
            console.log("Button-on", data);
            if (!$('#' + data.id).hasClass("on")) {
                $('#' + data.id).addClass("on");
                if (data.id == "button1") {
                    this.synth.playFreq(495);
                } else {
                    this.synth.playFreq(668.68);
                }
            }
        });

        events.on("arm-press", (data) => {
            console.log("Press " + data.id);
            if ($('#button' + data.id).hasClass("on")) {
                $('#button' + data.id).removeClass("on");
                this.socketController.sendJSONCommand({
                    command: 'button-off',
                    id: "button" + data.id
                });
                if (data.id == 1 ) {
                    this.synth.playFreq(556.88);
                } else {
                    this.synth.playFreq(742.50);
                }
            }
        })
        events.on("arm-release", (data) => {
            console.log("Release " + data.id);
        })
    }

    resize() {
        //this.breakout.resize();
    }

}
