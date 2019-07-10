import Tone from 'tone'
export default class Synth {
    constructor(audioContext, socketController) {
        console.log("Synth constructed!")
        this.socketController = socketController;
        this.audioContext = audioContext;
    }
    init() {
        console.log("Synth init");
        const oscillator =  new Tone.Oscillator(0, 'sine').toMaster().start();
        //Tone.Transport.start();
    }
    recordSound() {
        const synth = new Tone.Synth().toMaster();
        synth.volume.value = -30;
        synth.sync();
        synth.triggerAttackRelease("C4", "16n");
        synth.triggerAttackRelease("A4", "16n", '+8n');
        synth.triggerAttackRelease("F5", "16n", '+16n');
        /*
        this.playFreq(620,{start: 0, type:'sine', end: 0.5});
        this.playFreq(780,{start:0.05, type: 'sine', end:0.6});
        this.playFreq(880,{start:0.15, type: 'sine', end:0.6}); */
    }
    stopRecordSound() {
        const synth = new Tone.Synth().toMaster();
        synth.volume.value = -30;
        synth.sync();
        synth.triggerAttackRelease("F5", "16n");
        synth.triggerAttackRelease("A4", "16n", '+8n');
        synth.triggerAttackRelease("C4", "16n", '+16n');
    }
    playFreq(freq, {start = 0, end = 0.1, type = 'sine'} = {start: 0, end: 0.1, type: 'sine'}) {
        console.log("Play freq", freq);
        const oscillator =  new Tone.Oscillator(freq, type).toMaster();
        oscillator.start(start).stop(end);
    }
    onSensorMessage(data) {
        let value = new Uint8Array(data,1,1)[0];
        this.oscillator.frequency.setValueAtTime(50 + value, this.audioContext.currentTime); // value in hertz
        console.log("Sensor message!", value);
    }
}
