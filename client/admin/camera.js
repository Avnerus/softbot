import Nipple from 'nipplejs'

export default class Camera {
    constructor(socketController) {
        console.log("Camera control constructed!")
        this.socketController = socketController;

        this.moveNow = {
            x: 0,
            y: 0
        }

        this.timer = 0;
        this.UPDATE_INTERVAL = 200;
    }
    init() {
        let joystickOptions = {
            zone: document.getElementById('joystick'),
            mode: 'static',
            threshold: 0.5
        };
        this.joystick = Nipple.create(joystickOptions);
        this.joystick.on('move', (evt,data) => {
            this.onMove(data);
        });
        this.joystick.on('dir', (evt,data) => {
            this.onDir(data);
        });
        this.joystick.on('end', (evt,data) => {
            this.onEnd(data);
        });
        // For some reason this is needed for the joystick to start functioning
        window.dispatchEvent(new Event('resize'));


        $( "#slider" ).slider( {
            min:0,
            max:255,
            slide: (event,ui) => {
                this.onSlide(ui.value);
            },

        });
    }

    onMove(data) {
        this.moveNow.x = Math.round(data.position.x - this.joystick[0].position.x);
        this.moveNow.y = Math.round(data.position.y - this.joystick[0].position.y);
        //        console.log(this.moveNow);
    }
    onDir(data) {
        console.log("Camera dir!", data.direction.angle);
        let command = data.direction.angle.substring(0,1).toUpperCase();
        //this.socketController.sendSerialCommand(command,1)
    }
    onEnd(data) {
        console.log("End!");
        this.socketController.sendSerialCommand("S")
        this.moveNow.x = this.moveNow.y = 0;
    }
    onSlide(value) {
        console.log("Slide!", value);
        this.socketController.sendSerialCommand("P",value);
    }

    update(dt) {
        this.timer += dt;
        if (this.timer > this.UPDATE_INTERVAL && (this.moveNow.x != 0 || this.moveNow.y != 0)) {
            this.socketController.sendSerialCommand(
                'X', 
                this.moveNow.x + 50,
                this.moveNow.y + 50
            );
            this.timer = 0;
        }
    }
}
