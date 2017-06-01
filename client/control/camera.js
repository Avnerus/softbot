import Nipple from 'nipplejs'

export default class Camera {
    constructor(socketController) {
        console.log("Camera control constructed!")
        this.socketController = socketController;
    }
    init() {
        let joystickOptions = {
            zone: document.getElementById('joystick'),
            mode: 'static',
            threshold: 0.5
        };
        this.joystick = Nipple.create(joystickOptions);
        /*
        this.joystick.on('move', (evt,data) => {
            this.onMove(data);
        });*/
        this.joystick.on('dir', (evt,data) => {
            this.onDir(data);
        });
        this.joystick.on('end', (evt,data) => {
            this.onEnd(data);
        });
        $("#loading").hide();
        $("#joystick").show();
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
        //  console.log("Camera move", data.angle.degree);
    }
    onDir(data) {
        console.log("Camera dir!", data.direction.angle);
        let command = data.direction.angle.substring(0,1).toUpperCase();
        this.socketController.sendValueCommand(command,1)
    }
    onEnd(data) {
        console.log("End!");
        this.socketController.sendValueCommand("S",1)
    }
    onSlide(value) {
        console.log("Slide!", value);
        this.socketController.sendValueCommand("P",value);
    }
}
