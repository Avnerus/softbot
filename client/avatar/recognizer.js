const ANIMATION_TIME = 5000;

export default class Recognizer {
    constructor(socketController,  expression, synth, container) {
        console.log("Recognizer constructed!")
        this.socketController = socketController;
        this.expression = expression;
        this.container = container;
        this.synth = synth;
        this.wasStarted = false;
        this.timer = 0;
    }
    init() {
        console.log("Init recognizer", this.container);
        events.on('start-recognizing', (data) => {
            console.log("Start recognizing!", data);
            this.start(data.source);
        })
    }

    start(source) {
        console.log("Start recognizing!");
        this.socketController.sendJSONCommand({
            command: 'start-recognizing',
            source: source
        });
        this.showAnimation();
        //this.synth.recordSound();
        this.wasStarted = true;
        //this.expression.applyPoseMilliseconds("Thinking", 2000);
    }

    stop() {
        console.log("Stopping recognizing!");
        this.stopAnimation();
        this.wasStarted = false;
        //this.synth.stopRecordSound();
        this.socketController.sendJSONCommand({
            command: 'stop-recognizing'
        });
    }
    showAnimation() {
        this.container.css('display', 'table');
        this.container.find('.blue').css("animation","updown 1.2s infinite ease-in-out alternate");
        this.container.find('.red').css("animation","updown 1.2s 0.2s infinite ease-in-out alternate");
        this.container.find('.yellow').css("animation","updown 1.2s 0.4s infinite ease-in-out alternate");
        this.container.find('.green').css("animation","updown 1.2s 0.6s infinite ease-in-out alternate");
    }
    stopAnimation() {
        this.container.css('display', 'none');
        this.container.find('.blue').css("animation","none");
        this.container.find('.red').css("animation","none");
        this.container.find('.yellow').css("animation","none");
        this.container.find('.green').css("animation","none");
    }

    update(dt) {
        if (this.wasStarted) {
            this.timer += dt;
            if (this.timer < ANIMATION_TIME) {
                const newWidth = ((ANIMATION_TIME - this.timer) / ANIMATION_TIME) * 87;
                this.container.find('#timer').css("width",newWidth + '%');
            }
            else {
                this.stop();
                this.timer = 0;
            }
        }
    }
}
