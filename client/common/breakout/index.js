import Paddle from './paddle'

export default class Breakout {
    constructor(container, keyboard, socketController) {
        this.container = container;
        this.keyboard = keyboard;
        this.socketController = socketController;
    }

    init() {
        console.log("Breakout initializing")
        this.setup();

        this.paddle = new Paddle();
        this.paddle.init();
        this.paddle.position.x = 200;
        this.paddle.position.y = 200;
        this.app.stage.addChild(this.paddle);
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
}
