import _ from 'lodash'
import moment from 'moment'
import Typed from 'typed.js'

export default class Transcript {
    constructor(socketController,container) {
        console.log("Transcript constructed with container", container);
        this.socketController = socketController;
        this.container = container;
    }
    init() {
        this.socketController.on('recognized-speech',(data) => {
            console.log("Recognized speech!", data)
            data.from = "Speaker";
            this.addLine(data);
        });

        this.socketController.subscribeToPrefix('E', (msg) => {
            this.addLine({
                from: "Error",
                text: msg.slice(1)
            });
        });

        this.socketController.subscribeToPrefix('D', (msg) => {
            this.addLine({
                from: "Hitodama",
                text: new TextDecoder("utf-8").decode(new Uint8Array(msg,1))
            },false);
        });

        events.on("transcript", (data) => {
            this.addLine(data);
        });

        let fullDate = moment().format('MMMM Do YYYY, HH:mm:ss');
        let text = "Transcript started on " + fullDate;
        this.container.append('<div class="transcript-line"><u>' + text + '</u></div>');
        this.currentScrollHeight = this.container.parent().get(0).scrollHeight;
        console.log("Current scroll height", this.currentScrollHeight);
    }

    addLine(data, animate = true) {
        this.container.append('<div class="transcript-line ' + data.from.toLowerCase() + '"></div>');
        let text = '[' +  moment().format('HH:mm:ss') + '] <b>' +  data.from + ': </b>'  + data.text;
        if (animate) {
            let typed = new Typed(
                this.container.children().last()[0], {
                    strings: [text],
                    showCursor: false,
                    typeSpeed:0,
                    onStringTyped: () => {this.scroll();}
                }
            )
        } else {
            this.container.children().last().html(text);
            this.scroll(false);
        }
    }
    scroll(animate = true) {
        let scrollHeight = this.container.parent().get(0).scrollHeight;
        if (scrollHeight != this.currentScrollHeight) {
            if (animate) {
              this.container.parent().animate({
                scrollTop: scrollHeight
              }, 500)
            }
            else {
                this.container.parent()[0].scrollTop = scrollHeight;
            }
            this.currentScrollHeight = scrollHeight;
        }
    }
}
