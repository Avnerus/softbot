const LONG_PRESS_THRESHOLD = 800;

export default class Arms {
    constructor(socketController) {
        console.log("Arms controller constructed!")
        this.socketController = socketController;
    }
    init() {
        this.ARMS = [0,0];
        this.longPressTime = 0;
        this.longPressing = false;
        this.longPassedThreshold = false;

        this.socketController.subscribeToPrefix('S', (data) => {
            //console.log("Arm sense message!", data);
            let text = new TextDecoder("utf-8").decode(new Uint8Array(data,2))
            const armId = parseInt(text[1]);
            if (text[0] == 'P') {
                events.emit("arm-press", {id: armId})
                this.ARMS[armId - 1] = 1;
            } else if (text[0] == 'R') {
                events.emit("arm-release", {id: armId})
                this.ARMS[armId - 1] = 0;
            }

            this.longPressing =  (this.ARMS[0] && this.ARMS[1]);
            if (!this.longPressing) {
                if (this.longPassedThreshold) {
                    events.emit("arm-long-release");
                    this.longPassedThreshold = false;
                }
                this.longPressTime = 0;
            }
        })
    }

    update(dt) {
        if (this.longPressing) {
            this.longPressTime += dt;
            if (this.longPressTime >= LONG_PRESS_THRESHOLD && !this.longPassedThreshold) {
                this.longPassedThreshold = true;
                events.emit("arm-long-press");
            }
        } 
    }

}
