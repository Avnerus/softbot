import Breakout from '../common/breakout'

export default class GameController {
    constructor(socketController, container, keyboard) {
        console.log("Game Controller Constructed")
        this.socketController = socketController;
        this.container = container;
        this.keyboard = keyboard;
    }

    init() {
        console.log("Init Game Controller");
        this.socketController.subscribeToPrefix('P', (data) => this.onPlayMessage(data));
    }

    onPlayMessage(data) {
        console.log("Play message!", data);
        if (this.breakout) {
            this.breakout.onMessage(data);
        }
        else {
            if (data == 'PBREAKOUT') {
                // Start the breakout game
                $('.control-boxes').hide();
                $('.control-play').show();
                this.keyboard.grab();
                this.breakout = new Breakout(this.container, this.keyboard, this.socketController);
                this.breakout.init();
            }
        }
    }
}
