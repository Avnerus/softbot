import { html, render } from 'hybrids';
import store, {connect, PIC_STATE, PHASE} from './state'

const ready = (host, event) => {
    event.preventDefault();
    console.log("Ready!");
    host.socketController.send("SPIC" + String.fromCharCode(PIC_STATE.READY));
}

const OTHER = {
    "CONTROL": "AVATAR",
    "AVATAR": "CONTROL"
}

export default {
    socketController: connect(store, (state) => state.socketController),
    identity : "",
    picState: connect(store, (state) => state.picState),
    phase: connect(store, (state) => state.phase),
    render: ({socketController, identity, picState, phase}) => { 
       return html`
        <style>
            :host {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 97%;
                height: 100%;

            }
            #control-container {
                background-color: #fbf5fb;
                height: 90%;
                width: 100%;
                display: flex;
                align-items: center;
            }
            .control-button {
                width: 70px;
                height: 65px;
                padding: 5px;
                background-color: #dfdbfb;
                border-style: solid;
                border-width: 1px;
                border-radius: 5px;
                box-shadow: 2px 2px gray;
                display:flex;
                font-size: 70px;
            }
            .button-row {
                display: flex;
                flex-direction: row;
                justify-content: space-evenly;
                align-items: center;
                height: 100%;
                width: 100%;
            }
            #check-box {
                fill: green;
                height: 100%;
            }
        </style>
        <div id="control-container">
            <div class="button-row">
                ${picState[identity] == PIC_STATE.WAITING && html` 
                    <label> READY FOR THE NEXT IMAGES ? </label>
                    <a onclick="${ready}" href="">
                        <div class="control-button">
                            <svg id="check-box" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"/></svg>
                        </div>
                    </a>
                 `}
                 ${picState[identity] == PIC_STATE.READY && picState[OTHER[identity]] == PIC_STATE.WAITING && html` 
                     <label>Waiting for your partner to be ready...</label>
                  `}
                  ${picState[identity] == PIC_STATE.READY && picState[OTHER[identity]] == PIC_STATE.READY && html` 
                      <label>Choose your favorite image!</label>
                  `}
            </div>
        </div>
     `
   }
}
