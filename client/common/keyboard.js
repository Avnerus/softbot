export default class {
    constructor() {
        this.keys = {};
    }
    init() {

    }
    grab() {
        window.addEventListener(
          "keydown", (event) => {
            this.downHandler(event);
            event.preventDefault();
        });
        window.addEventListener(
          "keyup", (event) => {
            this.upHandler(event);
            event.preventDefault();
        });
    }
    downHandler(event) {
        if (this.keys[event.keyCode] && this.keys[event.keyCode].press && !this.keys[event.keyCode].isDown) {
            this.keys[event.keyCode].isDown = true;
            this.keys[event.keyCode].isUp = false;
            this.keys[event.keyCode].press();
        } 
    }
    upHandler(event) {
        if (this.keys[event.keyCode] && this.keys[event.keyCode].release && !this.keys[event.keyCode].isUp) {
            this.keys[event.keyCode].isDown = false;
            this.keys[event.keyCode].isUp = true;
            this.keys[event.keyCode].release();
        } 
    }
    onPress(keyCode, callback) {
        if (!this.keys[keyCode]) {
            this.keys[keyCode] = {};
        }
        this.keys[keyCode].press = callback;
        console.log(this.keys);
    }

    onRelease(keyCode, callback) {
        if (!this.keys[keyCode]) {
            this.keys[keyCode] = {};
        }
        this.keys[keyCode].release = callback;
    }
}
