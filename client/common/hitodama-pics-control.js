import { html, render } from 'hybrids';
import store, {connect, PIC_STATE, PHASE, OTHER} from './state'

const ready = (host, event) => {
    event.preventDefault();
    console.log("Ready!");
    if (host.picState[host.identity] == PIC_STATE.WAITING) {
        host.socketController.send("SPIC" + String.fromCharCode(PIC_STATE.READY));
    } else {
        host.socketController.send("SPIC" + String.fromCharCode(host.picState[host.identity] + 2));
    }
}

const getGuidelines = (picState, identity) => {
    const guidelines = [];
    let readyButton = false;

    if (picState[identity] == PIC_STATE.WAITING) {
        guidelines.push("READY FOR THE NEXT IMAGES ?")
        readyButton = true;
    }
    else if (picState[identity] == PIC_STATE.READY && picState[OTHER[identity]] == PIC_STATE.WAITING) {
        guidelines.push("Waiting for your partner to be ready...");
    }
    else if (picState[identity] == PIC_STATE.READY && picState[OTHER[identity]] >= PIC_STATE.READY) {
          guidelines.push("Choose your favorite image!");
    }
    else if (picState[identity] > PIC_STATE.READY && picState[OTHER[identity]] == PIC_STATE.READY) {
          guidelines.push("Waiting for partner to choose an image");
    }
    else if (picState[identity] >= PIC_STATE.READY &&  (picState[identity] - picState[OTHER[identity]]) % 2 == 0)  {
          guidelines.push("You chose the same image!");
    }
    else if (picState[identity] >= PIC_STATE.READY &&  (picState[identity] - picState[OTHER[identity]]) % 2 != 0) {
          guidelines.push("You chose a different image.");
    }
    if (picState[identity] >= PIC_STATE.EXPLAIN_1 && picState[identity] < PIC_STATE.DONE_1) {
          guidelines.push("Explain why you chose the image and press when ready");
          readyButton = true;
    }
    else if (picState[OTHER[identity]] >= PIC_STATE.EXPLAIN_1 && picState[OTHER[identity]] < PIC_STATE.DONE_1) {
          guidelines.push("Now the partner will explain why they chose their image");
    }
    
    return {guidelines, readyButton}
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
                flex-direction: row;
                justify-content: space-evenly;
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
            .text-container {
                display: flex;
                flex-direction: column;
                justify-content: space-evenly;
                align-items: center;
                height: 100%;
            }
            #check-box {
                fill: green;
                height: 100%;
            }
        </style>
        <div id="control-container">
            ${ Object.entries(getGuidelines(picState, identity)).map(([key, value]) => 
                key == 'guidelines' ? html `
                    <div class="text-container">
                        ${value.map( line => html`<label>${line}</label>`)}
                    </div>
                ` : 
                key == 'readyButton' && value == true ? html`
                    <div>
                        <a onclick="${ready}" href="">
                            <div class="control-button">
                                <svg id="check-box" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"/></svg>
                            </div>
                        </a>
                    </div>
                ` : ''
                )
            }
        </div>
     `
   }
}
