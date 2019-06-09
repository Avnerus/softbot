import { html, render } from 'hybrids';
import store, {connect} from '../common/state'

export default {
    transcript: connect(store, (state) => state.transcript),
    render: ({transcript}) => { 
       return html`
        <style>
            :host {
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            #transcript-container {
                height: 95%;
                width: 100%;
                background-color: #fffffff2;
                padding: 0px 20px;
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
        </style>
        <div id="transcript-container">
            ${transcript.map(( line ) => html
                `<div class="transcript-line ${line.from.toLowerCase()}">${line.from} : ${line.text}</div>
            `)}
        </div>
     `
   }
}
