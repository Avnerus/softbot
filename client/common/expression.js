import Expressions from './Expressions'
import _ from 'lodash'
    
export default class Expression {
    constructor(socketController) {
        console.log("expression constructed!")
        this.socketController = socketController;
    }
    init() {
        console.log("Init expression", this.speechForm);
        // Initializes and creates emoji set from sprite sheet
        
    }

    containsNegativeEmoji(string) {
        var ranges = [
            '\ud83d\ude41', //  U+1F641
            '\ud83d[\ude1e-\ude1f]' // U+1F61E-U+1F61F
        ];
        /*
        var ranges = [
            '\ud83c[\udf00-\udfff]', // U+1F300 to U+1F3FF
            '\ud83d[\udc00-\ude4f]', // U+1F400 to U+1F64F
            '\ud83d[\ude80-\udeff]' // U+1F680 to U+1F6FF
        ];*/
        if (string.match(ranges.join('|'))) {
            return true;
        } else {
            return false;
        }
    }
    containsPositiveEmoji(string) {
        var ranges = [
            '\ud83d\ude18', //  U+1F618
            '\ud83d[\ude00-\ude0f]' // U+1F600-U+1F60F
        ];
        if (string.match(ranges.join('|'))) {
            return true;
        } else {
            return false;
        }
    }
    express(text) {
        console.log("Expressing", text);
        if (this.containsNegativeEmoji(text)) {
            console.log("Negative!!");
            this.applyPoseMilliseconds("Angry", 3000);
        }
        else if (this.containsPositiveEmoji(text)) {
            console.log("Positive!");
            this.applyPoseMilliseconds("Happy", 3000);
        } else {
            // Neutral
            let reset = _.find(Expressions.expressions, {name: "Reset"});
            this.applyPose(reset)
       }
    }
    applyPose(pose) {
        let commands = Object.keys(pose);
        console.log("Pose", pose, commands);
        commands.forEach((command) => {
            if (typeof(pose[command]) == "number") {
                this.socketController.sendValueCommand(command,pose[command]);
            } else if (typeof(pose[command]) == "object") {
                this.socketController.sendValueCommand.apply(
                    this.socketController,
                    [command].concat(pose[command])
                )
            }
        });
    }
    applyPoseByName(poseName) {
        let pose = _.find(Expressions.expressions, {name: poseName});
        if (pose) {
            console.log("Apply pose", pose);
            this.applyPose(pose);
        }
    }

    applyPoseMilliseconds(poseName, time) {
        events.emit("expression_start");
        this.applyPoseByName(poseName);
        setTimeout(() => {
            this.applyPoseByName("Reset");
            events.emit("expression_end");
        },time);
    }
}
