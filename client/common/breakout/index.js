import Paddle from './paddle'
import {BreakoutAPI} from './breakout'
import { memory } from "./breakout_bg";

export default class Breakout {
    constructor(container, keyboard, socketController) {
        this.container = container;
        this.keyboard = keyboard;
        this.socketController = socketController;
        this.started = false;
    }

    init() {
        console.log("Breakout initializing")

        this.breakoutApi = BreakoutAPI.new();
        this.statePtr = this.breakoutApi.state();
        this.p1Y = new Uint32Array(memory.buffer, this.statePtr, 1);

        console.log("Breakout API", this.p1Y[0]);
        this.breakoutApi.tick();
        console.log("Tick", this.p1Y[0]);

    }

    setup() {
        this.app = new PIXI.Application({
            width: 800,
            height: 600
        });
        this.container.append(this.app.view);
        this.app.renderer.view.style.position = "absolute";
        this.app.renderer.view.style.display = "block";
        this.app.renderer.autoResize = true;

        this.app.ticker.add(this.update, this);

        this.keyboard.onPress(38, () => {
            this.paddle.velocity = -5;
        });
        this.keyboard.onRelease(38, () => {
            if (this.paddle.velocity < 0) {
                this.paddle.velocity = 0;
            }
        });
        this.keyboard.onPress(40, () => {
            this.socketController.send("AVNER");
            this.paddle.velocity = 5;
        });
        this.keyboard.onRelease(40, () => {
            if (this.paddle.velocity > 0) {
                this.paddle.velocity = 0;
            }
        });
        this.resize();
    }

    update(dt) {
        this.paddle.update(dt);
    }

    resize() {
        this.app.renderer.resize(this.container.width(), this.container.height());
    }

    onMessage(data) {
        console.log("Breakout message!", data);        
        if (!this.started) {
            let prefix = String.fromCharCode(new Uint8Array(data,1,1)[0]);
            console.log("Breakout: ", prefix);
            if (prefix == 'Z') {
                this.onSetup(data.slice(2,data.length));
                this.started = true;
            }
        }
    }

    onSetup(data) {
        console.log("Breakout setup", data);
        let playerId = new Uint8Array(data,0,1)[0]
        console.log("PlayerID: ", playerId);
        
        let resData = data.slice(1, data.length);
        let resolution = new Uint32Array(resData);
        console.log("Resolution", resolution);

        this.setup();

        this.paddle = new Paddle();
        this.paddle.init();
        this.paddle.position.x = 200;
        this.paddle.position.y = 200;
        this.app.stage.addChild(this.paddle);
    }
}
