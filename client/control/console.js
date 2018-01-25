import Expressions from '../common/Expressions';
import _ from 'lodash'

export default class Console {
    constructor(socketController, expression, consoleContainer) {
        console.log("Console constructed");
        this.socketController = socketController;
        this.expression = expression;
        this.consoleContainer = consoleContainer;
    }
    init() {
        console.log("Init Console", this.consoleContainer);
        this.consoleContainer.find("#console-form").submit((event) => {
            console.log("Console Command! ", event.currentTarget[0].value, event.currentTarget[1].value);


            let valuesArray = [];
            valuesArray.push(event.currentTarget[0].value);
            for (let i = 1; i < event.currentTarget.length; i++) {
                console.log(event.currentTarget[i].value);
                if (event.currentTarget[i].value != "") {
                    valuesArray.push(parseInt(event.currentTarget[i].value));
                }
            }
            console.log("Command values", valuesArray);
            this.socketController.sendValueCommand.apply(
                this.socketController,
                valuesArray
            )

            event.preventDefault();
        });

        this.consoleContainer.find("#console-form").keydown((e) => {
            if (e.keyCode == 13) {
                this.consoleContainer.find("#console-form").submit();
            }
        });

        this.consoleContainer.find(".console-slider").slider( {
            min:0,
            max:255,
            value: 0,
            slide: (event,ui) => {
                this.onSlide(ui);
            },
            change: (event, ui) => {
                this.onChange(ui);
            }
        });
        console.log("Expressions", Expressions);
        Expressions.expressions.forEach((item) => {
            this.consoleContainer.find("#pose-select").append(
                $("<option>").text(item.name).val(item.name)
            );
        });
        this.consoleContainer.find("#pose-select").change(() => this.poseSelect());
    }

    onSlide(ui) {
        let container = $(ui.handle).parent().parent();
        let command = container.data("command");
        this.socketController.sendValueCommand(command, ui.value);

        // Save the pose
        let selectedPose = this.consoleContainer.find("select option:selected").val();
        let commands = _.find(Expressions.expressions,{name:selectedPose});
        commands[command] = ui.value;

    }
    onChange(ui) {
        let container = $(ui.handle).parent().parent();
        container.find(".console-slider-value").html(ui.value);
    }

    poseSelect() {
        let selectedPose = this.consoleContainer.find("select option:selected").val();
        let commands = _.find(Expressions.expressions,{name:selectedPose});
        console.log("Commands", commands);
        this.consoleContainer.find("#eye-slider").slider("value",commands["E"]);
        this.consoleContainer.find("#cheek-slider").slider("value",commands["C"]);
        this.consoleContainer.find("#mouth-slider").slider("value",commands["M"]);
        this.expression.applyPose(commands);
    }
}
