import { html, render, define } from 'hybrids';
import store, {connect} from '../common/state'

const scrollDown = (host) => {
    /*
    setTimeout(() => {
        const container = host.shadowRoot.querySelector("#transcript-container");
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    },0)*/
}

const scrollToBottom = (host, event) => {
    host.scrollTop = host.scrollHeight;
}
const autoScroller = {
    render: () => html`
        <style>
            :host {
                overflow: scroll;
                height: 100%;
                width: 100%;
            } 
        </style>
        <slot onslotchange="${scrollToBottom}"></slot>
    `
}

define('auto-scroller', autoScroller);

export default {
    transcript: connect(store, (state) => state.transcript),
    render: (host) => { 
       return html`
        <style>
            :host {
                height: 95%;
                width: 99%;
                margin-top: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #fffffff2;
                overflow: hidden;
            }
            .transcript-line {
                margin-top: 10px;
                margin-left: 5px;
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
        <auto-scroller>
            ${host.transcript.map(( line ) => html
                `<div class="transcript-line ${line.class ? line.class : line.from.toLowerCase()}">${line.from} : ${line.text}</div>
            `)}
        </auto-scroller>
        `
   }
}
