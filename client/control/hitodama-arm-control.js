import { html, render } from 'hybrids';
import store, {connect, CHAMBERS} from '../common/state'

import RaiseArm from './images/raise-arm.png'
import LowerArm from './images/lower-arm.png'

import * as Hitodama from '../common/hitodama'

const raiseArm = (host, event) => {
    event.preventDefault();
    console.log("Raise arm!");
    Hitodama.inflateTo(
        host.socketController,
        CHAMBERS.ARMS,
        0.8
    )
}
const lowerArm = (host, event) => {
    event.preventDefault();
    console.log("Lower arm!");
    Hitodama.deflate(
        host.socketController,
        CHAMBERS.ARMS
    )
}
export default {
    socketController: connect(store, (state) => state.socketController),
    render: ({socketController}) => { 
       return html`
        <style>
            :host {
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;

            }
            #control-container {
                background-color: #fbf5fb;
                height: 100%;
                width: 100%;:
            }
            .control-button {
                width: var(--icon-size, 70px);
                height: var(--icon-size, 65px);
                padding: 5px;
                background-color: #dfdbfb;
                border-style: solid;
                border-width: 1px;
                border-radius: 5px;
                box-shadow: 2px 2px gray;
                display:flex;
                font-size: var(--icon-size, 70px);
                text-decoration: none;
                align-items: center;
                justify-content: center;
                color: #f46161;
                margin-left: 5px;
                margin-right: 5px;
            }
            .control-button.active {
                background-color: red;
            }
            .button-row {
                display: flex;
                justify-content: space-evenly;
                flex-direction: var(--button-direction,row);
                align-items: center;
                height: 100%;
            }
        </style>
        <div id="control-container">
            <div class="button-row">
                <a 
                    class="control-button"
                    onclick="${raiseArm}"
                    href=""
                >
                    <img src=${RaiseArm}>
                </a>
                <a 
                    class="control-button"
                    onclick="${lowerArm}"
                    href=""
                >
                    <img src=${LowerArm}>
                </a>
            </div>
        </div>
     `
   }
}
