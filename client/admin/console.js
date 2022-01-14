import Expressions from '../common/Expressions';
import _ from 'lodash'

export default class Console {
    constructor(socketController, expression, consoleContainer) {
        console.log("Console constructed");
        this.socketController = socketController;
        this.expression = expression;
        this.consoleContainer = consoleContainer;
        this.pressures = {};
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
            this.socketController.sendSerialCommand.apply(
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

        this.consoleContainer.find("#clear-console-button").click((e) => {
            $("#transcript").html("");
        });
        this.consoleContainer.find("#pump-checkbox").change((e) => {
            console.log("Pump ?");
            if($(e.target).prop('checked')) {
                this.socketController.sendSerialCommand('P', 200);
            } else {
                this.socketController.sendSerialCommand('P', 0);
            }
        });

        this.consoleContainer.find(".chamber-button").click((e) => {
            const chamberIndex = this.consoleContainer.find('select[name="chambers"]').val();
            const chamberState = $(e.currentTarget).attr("data-state-id");
            console.log("Change chamber " + chamberIndex + " to state " + chamberState + "!!");
            //this.socketController.sendSerialCommand('H',chamberIndex, chamberState);
            this.socketController.sendValueCommand("A" + chamberIndex, 0, chamberState.charCodeAt(0), 255);
        });

        this.socketController.subscribeToPrefix('S', (msg) => {
            let chars = new Uint8Array(msg, 2);
            let end = chars.findIndex(n => n == 0);
            let chamber = new TextDecoder("utf-8").decode(chars.slice(0,end));
            let pressure = new DataView(msg,end + 2);
            this.pressures[chamber] = pressure.getInt16();
            this.renderPressures();
        })


    }

    dummyPressures() {
        this.pressures = {
            "LeftNeck": 96,
            "RightNeck": 95,
            "DownNeck": 110,
            "Eyes" : 90,
            "Cheeks": 89,
            "Arms": 120,
            "Mouth": 87
        }
        this.renderPressures();
    }

    renderPressures() {
        let list = $("#pressure-list");
        list.html("");
        for (let entry of Object.entries(this.pressures)) {
            let [key, value] = entry;
            let li = document.createElement("li");
            li.innerHTML = key + ": " + value;
            list.append(li);
        }


    }

    onSlide(ui) {
        let container = $(ui.handle).parent().parent();
        let command = container.data("command");
       
        this.socketController.sendValueCommand("A" + command, 0, "C".charCodeAt(0), ui.value);

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
