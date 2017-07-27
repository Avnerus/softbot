export default class Speech {
    constructor(socketMessenger, speechForm) {
        console.log("Speech constructed!")
        this.socketMessenger = socketMessenger;
        this.speechForm = speechForm;
    }
    init() {
        console.log("Init speech", this.speechForm);
        // Initializes and creates emoji set from sprite sheet
        
        this.emojiPicker = new EmojiPicker({
          emojiable_selector: '[data-emojiable=true]',
          assetsPath: 'lib/emoji-picker/img/',
          popupButtonClasses: 'fa fa-smile-o'
        });
       
        this.emojiPicker.discover();

        this.speechForm.keydown((e) => {
            if (e.keyCode == 13) {
                this.speechForm.submit();
            }
        });
        this.speechForm.submit((event) => {
            if (event.currentTarget[0].value.length > 0) {

                console.log("Say! ", event.currentTarget[0].value,event.currentTarget[1].value, event.currentTarget[2].value, event.currentTarget[3].checked);
                this.socketMessenger.emit('speech', {
                    text: event.currentTarget[0].value,
                    voice: event.currentTarget[1].value,
                    pitch: event.currentTarget[2].value,
                    translate: event.currentTarget[3].checked
                } );

                events.emit("transcript", {from: "You", text: event.currentTarget[0].value})
                event.currentTarget[0].value = "";
                this.speechForm.find('.emoji-wysiwyg-editor').text("");
            }
            event.preventDefault();
        })

        //this.speechForm.find('#speech-text').on('input', () => this.replaceEmoji());
    }

    replaceEmoji() {
    }
}
