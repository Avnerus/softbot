export default class Arms {
    constructor(socketController) {
        console.log("Arms controller constructed!")
        this.socketController = socketController;
    }
    init() {
        this.socketController.subscribeToPrefix('S', (data) => {
            //console.log("Arm sense message!", data);
            let text = new TextDecoder("utf-8").decode(new Uint8Array(data,2))
            if (text[0] == 'P') {
                events.emit("arm-press", {id: parseInt(text[1])})
            } else if (text[0] == 'R') {
                events.emit("arm-release", {id: parseInt(text[1])})
            }
            //this.oscillator.frequency.setValueAtTime(220 + value, this.audio.currentTime);
            //console.log(value); 
        })
    }

}
