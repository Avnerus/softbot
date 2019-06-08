import { html, render } from 'hybrids';
import store, {connect} from './state'

export default {
    transcript: connect(store, (state) => state.transcript),
    render: ({transcript}) => { 
       return html`
        <style>
            #transcript-container {
                height: 95%;
                width: 100%;
                background-color: #fffffff2;
            }
        </style>
        <div id="transcript-container">
        </div>
     `
   }
}
