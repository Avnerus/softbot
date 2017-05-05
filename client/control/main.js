import Streamer from './streamer'
import Body from './body'
import Camera from './camera'
import JanusConnection from './janus-connection'
import SocketController from '../common/socket-controller'
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

        this.socketController = new SocketController("ws://192.168.8.232:9540/ws");
        this.socketController.init();

        this.streamer = new Streamer();
        this.streamer.init();

        this.body = new Body();
        this.body.init();

        this.camera = new Camera(this.socketController);
        this.camera.init();

        this.janusConnection = new JanusConnection('http://192.168.8.232:8088/janus');
        this.janusConnection.init();

    }
}
