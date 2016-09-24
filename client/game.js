import EventEmitter from 'events'
import SocketController from './socket-controller'

export default class  {
    constructor(config) {
        console.log("Game constructed!")
        this.config = config;
        this.started = false;
    }
    init() {
        class CustomEmitter extends EventEmitter {}
        this.emitter = new CustomEmitter();
        global.events = this.emitter;


        this.socketController = new SocketController();
        this.socketController.init();

        document.addEventListener('keydown', (event) => {
            // 87, 65, 83, 68
            let element = document.getElementById('key_' + event.keyCode);
            if (element) {
                element.style["background-color"] = "white";
                element.style.color = "black";
            }

            return false;
        }, false);

        document.addEventListener('keyup', (event) => {
            // 87, 65, 83, 68
            let element = document.getElementById('key_' + event.keyCode);
            if (element) {
                element.style["background-color"] = "black";
                element.style.color = "white";

                this.socketController.emit("key-command", event.keyCode);
            }
            return false;
        }, false);
    }

    load(onLoad) {

        onLoad();

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
