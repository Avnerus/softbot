import { html, render } from 'hybrids';
import store, {connect} from '../common/state'

const scrollDown = (host) => {
    setTimeout(() => {
        const container = host.shadowRoot.querySelector("#transcript-container");
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    },0)
}

export default {
    transcript: connect(store, (state) => state.transcript),
    render: (host) => { 
       return html`
        <style>
            :host {
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }
            #transcript-container {
                height: 95%;
                width: 100%;
                background-color: #fffffff2;
                margin-right: 5px;
                overflow: scroll;
            }
            .transcript-line {
                margin-top: 10px;
            }
            .transcript-line.error {
                color: red;
            }
            .transcript-line.system {
                color: green;
            }
            .transcript-line.expression {
                font-weight: bold;
            }
            .transcript-line.gaze {
                font-style: italic;
            }
        </style>
        <div id="transcript-container" scrollTop=${scrollDown(host)}>
            ${host.transcript.map(( line ) => html
                `<div class="transcript-line ${line.class ? line.class : line.from.toLowerCase()}">${line.from} : ${line.text}</div>
            `)}
        </div>
     `
   }
}
