export default class Recognizer {
    constructor(socketController,  expression, synth, container) {
        console.log("Recognizer constructed!")
        this.socketController = socketController;
        this.expression = expression;
        this.container = container;
        this.synth = synth;
        this.wasStarted = false;
    }
    init() {
        console.log("Init recognizer", this.container);
        events.on('arm-long-press', () => {
            console.log("Long press!");
            this.start();
        })
        events.on('arm-long-release', () => {
            console.log("Long release!");
            this.stop();
        })
    }

    start() {
        console.log("Start recognizing!");
        this.socketController.sendJSONCommand({
            command: 'start-recognizing'
        });
        this.showAnimation();
        this.synth.recordSound();
        //this.expression.applyPoseMilliseconds("Thinking", 2000);
    }

    stop() {
        console.log("Stopping recognizing!");
        this.stopAnimation();
        this.synth.stopRecordSound();
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
}
