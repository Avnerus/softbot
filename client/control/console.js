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

            this.socketController.sendValueCommand(
                event.currentTarget[0].value,
                event.currentTarget[1].value
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
