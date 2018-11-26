export default class Synth {
    constructor(audioContext, socketController) {
        console.log("Synth constructed!")
        this.socketController = socketController;
        this.audioContext = audioContext;
    }
    init() {
        this.socketController.subscribeToPrefix('S', (data) => this.onSensorMessage(data));

        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
        this.gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);

        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = 'sawtooth';
        this.oscillator.frequency.setValueAtTime(50, this.audioContext.currentTime); // value in hertz
        this.oscillator.connect(this.gainNode);
        this.oscillator.start();
    }
    onSensorMessage(data) {
        let value = new Uint8Array(data,1,1)[0];
        this.oscillator.frequency.setValueAtTime(50 + value, this.audioContext.currentTime); // value in hertz
        console.log("Sensor message!", value);
    }
}
