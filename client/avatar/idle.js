import Util from '../common/util'

export default class Idle {
    constructor(socketController, expression) {
        console.log("Idle constructed!")
        this.socketController = socketController;
        this.expression = expression;
        this.intervalTimer = 0;
        this.breathingTimer = 0;
        this.nowBreathing = false;
        this.active = false;
        this.currentBreathingTime = 0;

        this.BREATHING_INTERVAL = 5000;
    }
    init() {
        console.log("Init Idle");
        events.on('socket_connected', () => {
            this.connected();
        });

        events.on('expression_start', () => {
            this.active = false;
        });
        events.on('expression_end', () => {
            this.active = true;
        });
        events.on('voice_start', () => {
            this.active = false;
        });
        events.on('voice_end', () => {
            this.active = true;
        });

    }

    update(dt) {
        if (this.active) {
            if (this.nowBreathing) {
                this.breathingTimer += dt;
            }
            else {
                this.intervalTimer += dt;
            }

            if (!this.nowBreathing && this.intervalTimer >= this.BREATHING_INTERVAL) {
                this.currentBreathingTime = Util.getRandomInt(1000, 3000);
                this.expression.applyPoseByName("Breathing");
                this.intervalTimer = 0;
                this.nowBreathing = true;
            }
            else if (this.nowBreathing && this.breathingTimer >= this.currentBreathingTime) {
                this.breathingTimer = 0;
                this.nowBreathing = false;
                this.expression.applyPoseByName("Reset");
            }
        }
    }

    connected() {
        console.log("Idle connected, starting breathing")
        this.active = true;
        this.expression.applyPoseByName("Reset");
    }
}
