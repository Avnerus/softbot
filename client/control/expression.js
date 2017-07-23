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

    express(text) {
        console.log("Expressing", text);
        if (this.containsNegativeEmoji(text)) {
            console.log("Negative!!");
            this.socketController.sendValueCommand("E",255);
        }
    }
}
