export default class Paddle extends PIXI.Container {
    constructor() {
        super();
    }
    
    init() {
        this.shape = new PIXI.Graphics();
        this.shape.clear();
        this.shape.beginFill(0x0000FF);
        this.shape.lineStyle(1,0x000000);
        this.shape.drawRect(0,0, 100, 20);

        this.addChild(this.shape);
    }
}
