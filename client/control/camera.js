import Nipple from 'nipplejs'

export default class Camera {
    constructor(socketController) {
        console.log("Camera control constructed!")
        this.socketController = socketController;
    }
    init() {
        let joystickOptions = {
            zone: document.getElementById('joystick'),
            mode: 'static'
        };
        this.joystick = Nipple.create(joystickOptions);
        this.joystick.on('move', (evt,data) => {
            this.onMove(data);
        })
        $("#loading").hide();
        $("#joystick").show();
        // For some reason this is needed for the joystick to start functioning
        window.dispatchEvent(new Event('resize'));

        $( "#slider" ).slider( {
            min:0,
            max:255,
            slide: (event,ui) => {
                this.onSlide(ui.value);
            }
        });
    }

    onMove(data) {
        console.log("Camera move", data);
        var buffer = new ArrayBuffer(8);
        var z = new Int32Array(buffer);
        z[0] = 42;
        z[1] = 13;
        console.log(buffer);
        this.socketController.send(buffer);
    }
    onSlide(value) {
        console.log("Slide!", value);
        var buffer = new ArrayBuffer(2);
        var z = new Uint8Array(buffer);
        z[0] = "P".charCodeAt(0)// PUMP;
        z[1] = value;
        this.socketController.send(buffer);
    }
}
