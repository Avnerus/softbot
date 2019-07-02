import { html, render } from 'hybrids';
import store, {connect, CHAMBERS} from '../common/state'

import LookLeft from './images/look-left.png'
import LookRight from './images/look-right.png'
import LookStraight from './images/look-straight.png'

import EmojiAngry from './images/emoji-angry.png'
import EmojiAstonished from './images/emoji-astonished.png'
import EmojiHappy from './images/emoji-happy.png'

import * as Hitodama from '../common/hitodama'

const look = (host, event) => {
    event.preventDefault();
    const direction = $(event.target).attr("data-direction");
    $(event.target).addClass("active");
    console.log("Look " + direction);
    if (direction == "up") {
        Hitodama.inflateTo(
            host.socketController,
            CHAMBERS.DOWN_NECK,
            0.8
        )
    } else if (direction == "down") {
        Hitodama.deflate(
            host.socketController,
            CHAMBERS.DOWN_NECK
        )
    } 
}
const stop = (host, event) => {
    event.preventDefault();
    console.log("Stop!");
    $(event.target).removeClass("active");
    Hitodama.stop(host.socketController, CHAMBERS.DOWN_NECK);
}
const click = (host, event) => event.preventDefault();

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
                    data-direction="up" 
                    class="control-button"
                    onmousedown="${look}"
                    onmouseup="${stop}"
                    onclick="${click}"
                    href=""
                >
                    ⬆️
                </a>
                <a 
                    data-direction="down" 
                    class="control-button"
                    onmousedown="${look}"
                    onmouseup="${stop}"
                    onclick="${click}"
                    href=""
                >
                        ⬇️
                </a>
            </div>
        </div>
     `
   }
}
