import Streamer from './streamer'
import Body from './body'
import Camera from './camera'
import Speech from './speech'
import JanusConnection from './janus-connection'
import SocketController from '../common/socket-controller'
import SocketMessenger from '../common/socket-messenger'
import Events from 'events'

export default class Main {
    constructor() {
        console.log("Control Main constructed!")
    }
    init() {
        console.log("Conrol Main init ", document.host)
        class CustomEmitter extends Events.EventEmitter {}
        this.emitter = new CustomEmitter();
        global.events = this.emitter;

        this.socketController = new SocketController("ws://127.0.0.1:9540/ws");
        this.socketController.init();

        this.socketMessenger = new SocketMessenger('registerControl');
        this.socketMessenger.init();

        /*
        this.streamer = new Streamer();
        this.streamer.init();*/

        this.body = new Body();
        this.body.init();

        this.camera = new Camera(this.socketController);
        this.camera.init();

        this.speech = new Speech(this.socketMessenger, $("#speech-form"));
        this.speech.init();

        this.janusConnection = new JanusConnection('http://10.0.1.26:8088/janus');
        //this.janusConnection.init();

    }
}
