import { html, render } from 'hybrids';
import store, {connect, CHAMBERS} from '../common/state'

export default {
    socketController: connect(store, (state) => state.socketController),
    arms: connect(store, (state) => state.arms),
    render: ({socketController, arms}) => { 
       return html`
        <style>
            :host {
                height: 100%;
                display: flex;
                justify-content: space-around;
            }
            div {
                width: 48%;
                height: 100%;
                border-radius: 20px;
            }
            .pressed {
                background-color: rgba(15, 182, 206, 0.14);
            }
        </style>
        <div class="${arms[0] ? 'pressed' : 'normal'}" id="right-arm"></div>
        <div class="${arms[1] ? 'pressed' : 'normal'}" id="left-arm"></div>
     `
   }
}
