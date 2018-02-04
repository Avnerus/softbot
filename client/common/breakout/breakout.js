export default class Breakout {
    constructor(container) {
        this.container = container;
    }

    init() {
        console.log("Initializing breakout");
        this.app = new PIXI.Application({
            width: 800,
            height: 600
        });
        this.container.append(this.app.view);
        this.app.renderer.view.style.position = "absolute";
        this.app.renderer.view.style.display = "block";
        this.app.renderer.autoResize = true;
    }

    update() {

    }

    render() {
        this.app.renderer.render(this.app.stage);
    }

}
