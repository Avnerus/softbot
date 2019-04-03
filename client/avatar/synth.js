export default class Synth {
    constructor(audioContext, socketController) {
        console.log("Synth constructed!")
        this.socketController = socketController;
        this.audioContext = audioContext;
    }
    init() {
        //this.socketController.subscribeToPrefix('S', (data) => this.onSensorMessage(data));

        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
        this.gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);

        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = 'sawtooth';
        this.oscillator.frequency.setValueAtTime(50, this.audioContext.currentTime); // value in hertz
        this.oscillator.connect(this.gainNode);
        //this.oscillator.start();

        window.oscillator = this.oscillator;
        window.gain = this.gainNode;

        console.log("Synth playing");
    }
    playFreq(freq) {
        console.log("Play freq", freq);
        let oscillator = this.audioContext.createOscillator();
        oscillator.connect(this.audioContext.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime); // value in hertz
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    onSensorMessage(data) {
        let value = new Uint8Array(data,1,1)[0];
        this.oscillator.frequency.setValueAtTime(50 + value, this.audioContext.currentTime); // value in hertz
        console.log("Sensor message!", value);
    }
}
