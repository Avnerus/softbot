import _ from 'lodash'
import moment from 'moment'
import Typed from 'typed.js'

export default class Transcript {
    constructor(socketMessenger, container) {
        console.log("Transcript constructed with container", container);
        this.socketMessenger = socketMessenger;
        this.container = container;
    }
    init() {
        this.socketMessenger.on('recognized-speech',(data) => {
            console.log("Recognized speech!", data)
            data.from = "Speaker";
            this.addLine(data);
        });

        events.on("transcript", (data) => {
            this.addLine(data);
        });

        let fullDate = moment().format('MMMM Do YYYY, HH:mm:ss');
        let text = "Transcript started on " + fullDate;
        this.container.append('<div class="transcript-line"><u>' + text + '</u></div>');
        this.currentScrollHeight = this.container.get(0).scrollHeight;
        console.log("Current scroll height", this.currentScrollHeight);
    }

    addLine(data) {
        this.container.append('<div class="transcript-line ' + data.from.toLowerCase() + '"></div>');
        let typed = new Typed(
            this.container.children().last()[0], {
                strings: ['[' +
                    moment().format('HH:mm:ss') + '] <b>' + 
                    data.from + ': </b>'  + data.text
                ],
                showCursor: false,
                typeSpeed:0,
                onStringTyped: () => {this.scroll();}
            }

        )
    }
    scroll() {
        let scrollHeight = this.container.get(0).scrollHeight;
        if (scrollHeight != this.currentScrollHeight) {
          console.log("Scroll!");
          this.container.animate({
            scrollTop: scrollHeight
          }, 500)
          this.currentScrollHeight = scrollHeight;
        }
    }
}
