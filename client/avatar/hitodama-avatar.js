import { html, render } from 'hybrids';
import store, {connect} from '../common/state'

export default {
    softbotState: connect(store, (state) => state.softbotState),
    render: ({softbotState}) => { 
       return html`
        <style>
            :host {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;

            }
            #avatar-container {
                background-color: #fbf5fb;
                height: 30px;
                padding: 20px;
                font-size: 20px;
                width: 100%;
            }
            .controller-name {
                color: red;
            }
        </style>
        <div id="avatar-container">
        ${softbotState.softControllerName.length > 0 ? html`
            Connected to: <span class="controller-name">${softbotState.softControllerName}</span>
        ` : html`
            Waiting for controller...
        `}
        </div>
     `
   }
}
