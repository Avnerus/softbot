const LONG_PRESS_THRESHOLD = 800;
const LONG_PRESS_WAIT = 5000;

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
        this.timeSinceLongPress = 0;

        this.socketController.subscribeToPrefix('S', (data) => {
            //console.log("Arm sense message!", data);
            let text = new TextDecoder("utf-8").decode(new Uint8Array(data,2))
            const armId = parseInt(text[1]);
            if (text[0] == 'P') {
                console.log("Press " + armId);
                if (!this.longPassedThreshold) {
                    events.emit("arm-press", {id: armId})
                }
                this.ARMS[armId - 1] = 1;
            } else if (text[0] == 'R') {
                console.log("Release " + armId);
                if (!this.longPassedThreshold) {
                    events.emit("arm-release", {id: armId})
                }
                this.ARMS[armId - 1] = 0;
            }

            this.longPressing =  (this.ARMS[0] && this.ARMS[1]);
            if (!this.longPressing) {
                /*
                if (this.longPassedThreshold) {
                    events.emit("arm-long-release");
                }*/
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
        if (this.longPassedThreshold) {
            this.timeSinceLongPress += dt;
            if (this.timeSinceLongPress  > LONG_PRESS_WAIT) {
                this.longPassedThreshold = false;
                this.timeSinceLongPress = 0;
            }
        }
    }

}
