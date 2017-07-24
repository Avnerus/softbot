export default class Console {
    constructor(socketController, consoleForm) {
        console.log("Console constructed");
        this.socketController = socketController;
        this.consoleForm = consoleForm;
    }
    init() {
        console.log("Init Console", this.consoleForm);
        this.consoleForm.submit((event) => {
            console.log("Console Command! ", event.currentTarget[0].value, event.currentTarget[1].value);

            let valuesArray = [];
            for (let i = 1; i < event.currentTarget.length; i++) {
                console.log(event.currentTarget[i].value);
                if (event.currentTarget[i].value != "") {
                    valuesArray.push(parseInt(event.currentTarget[i].value));
                }
            }
            console.log("Command values", valuesArray);
            this.socketController.sendValueCommand(
                event.currentTarget[0].value,
                valuesArray
            );

            event.preventDefault();
        });

        this.consoleForm.keydown((e) => {
            if (e.keyCode == 13) {
                this.consoleForm.submit();
            }
        });
    }
}
