import Paddle from './paddle'

export default class Breakout {
    constructor(container) {
        this.container = container;
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
    }

    update(dt) {

    }

    resize() {
        this.app.renderer.resize(this.container.width(), this.container.height());
    }
}
