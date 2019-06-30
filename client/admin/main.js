import Streamer from './streamer'
import Body from './body'
import Camera from './camera'
import Speech from './speech'
import JanusConnection from './janus-connection'
import SocketController from '../common/socket-controller'
//import SocketMessenger from '../common/socket-messenger'
import Events from 'events'
import Recorder from './recorder'
import YoutubeRemote from './youtube-remote'
import Transcript from './transcript'
import Listener from './listener'
import Expression from '../common/expression'
import Console from './console'
import Display from './display'
import Keyboard from '../common/keyboard'

import './css/control.css'

export default class Main {
    constructor() {
        console.log("Control Main constructed!")
    }
    init() {
        console.log("Conrol Main init ", document.host)
        class CustomEmitter extends Events.EventEmitter {}
        this.emitter = new CustomEmitter();
        global.events = this.emitter;

        //this.socketController = new SocketController("ws://192.168.100.104:9002");
        //this.socketController = new SocketController("ws://10.0.1.56:9002");
        //this.socketController = new SocketController("ws://10.0.1.41:9540/ws");
        //this.socketController.init();
        
        this.socketController = new SocketController("ws://127.0.0.1:3012");
        //this.socketController = new SocketController("wss://incarnation.hitodama.online");
        events.on('socket_connected', () => {
            console.log("Socket connected registering control");
            events.emit("transcript", {from: "System", text: "Socket connected"});
            this.socketController.sendValueCommand("R",2);
        })
        this.socketController.init();

        /*
        this.socketMessenger = new SocketMessenger('registerControl');
        this.socketMessenger.init();*/

        this.recorder = new Recorder($('#recorder-container'));

        this.streamer = new Streamer(this.recorder);
        this.streamer.init();

        this.body = new Body();
        this.body.init();

        this.camera = new Camera(this.socketController);
        this.camera.init();

        this.speech = new Speech(this.socketController, $("#speech-form"));
        this.speech.init();

        this.youtubeRemote = new YoutubeRemote(this.socketController, $('#youtube-form'));
        this.youtubeRemote.init();

        this.janusConnection = new JanusConnection('https://stream.hitodama.online/janus');
        this.janusConnection.init();

        this.transcript = new Transcript(this.socketController, $('#transcript'));
        this.transcript.init();

        /*
        this.listener = new Listener(this.socketController, $('#listen-container'), this.streamer);
        this.listener.init();*/

        this.expression = new Expression(this.socketController);
        this.expression.init();

        this.console = new Console(this.socketController, this.expression, $('#console'));
        this.console.init();

        this.keyboard = new Keyboard();

        this.display = new Display(this.socketController, $("#breakout-form"), this.keyboard);
        this.display.init();


        $("#test-buttons").click((e) => {
            console.log("Button click",e.target.id);
            $(e.target).addClass("on");
            this.socketController.sendJSONCommand({
                command: 'button-on',
                id: e.target.id
            });
        });

        this.socketController.on('button-off', (data) => {
            console.log("Button-off", data);
            $('#' + data.id).removeClass("on");
        });

    }
    animate(dt) {
        this.update(dt);
    }

    update(dt) {
        this.camera.update(dt);
    }
}
