import Streamer from './streamer'
import Body from './body'
import Camera from './camera'
import Speech from './speech'
import JanusConnection from './janus-connection'
import SocketController from '../common/socket-controller'
import SocketMessenger from '../common/socket-messenger'
import Events from 'events'
import Recorder from './recorder'
import YoutubeRemote from './youtube-remote'

export default class Main {
    constructor() {
        console.log("Control Main constructed!")
    }
    init() {
        console.log("Conrol Main init ", document.host)
        class CustomEmitter extends Events.EventEmitter {}
        this.emitter = new CustomEmitter();
        global.events = this.emitter;

        // this.socketController = new SocketController("ws://192.168.179.3:9540/ws");
        this.socketController = new SocketController("ws://10.0.1.56:9002");
        //this.socketController = new SocketController("ws://127.0.0.1:9540/ws");
        this.socketController.init();

        this.socketMessenger = new SocketMessenger('registerControl');
        this.socketMessenger.init();

        this.recorder = new Recorder($('#recorder-container'));

        this.streamer = new Streamer(this.recorder);
        this.streamer.init();

        this.body = new Body();
        this.body.init();

        this.camera = new Camera(this.socketController);
        this.camera.init();

        this.speech = new Speech(this.socketMessenger, $("#speech-form"));
        this.speech.init();

        this.youtubeRemote = new YoutubeRemote(this.socketMessenger, $('#youtube-form'));
        this.youtubeRemote.init();

        this.janusConnection = new JanusConnection('http://192.168.179.3:8088/janus');
        this.janusConnection.init();

    }
}
