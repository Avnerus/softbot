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
}
