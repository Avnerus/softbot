import Breakout from '../common/breakout'
import Keyboard from '../common/keyboard'

export default class Display {
    constructor(socketController, playForm, keyboard) {
        console.log("Display control constructed!")
        this.socketController = socketController;
        this.playForm = playForm;
        this.keyboard = keyboard;
    }
    init() {
        this.playForm.find('#start-breakout').click(() => {
            this.socketController.send("SBREAKOUT");
        });

        this.socketController.subscribeToPrefix('P', (data) => this.onMessage(data));
    }

    onMessage(data) {
        console.log("Play message!", data);
        if (data == 'PBREAKOUT') {
            // Start the breakout game
            $('.control-boxes').hide();
            $('.control-play').show();
            this.keyboard.grab();
            this.breakout = new Breakout($('.control-play'), this.keyboard, this.socketController);
            this.breakout.init();
        }
    }
}
