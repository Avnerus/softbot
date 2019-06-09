import { html, render } from 'hybrids';
import store, {connect, PIC_STATE} from './state'

const ready = (host, event) => {
    event.preventDefault();
    console.log("Ready!");
    host.socketController.send("SPIC" + String.fromCharCode(PIC_STATE.READY));
}

export default {
    socketController: connect(store, (state) => state.socketController),
    picState: connect(store, (state) => state.picState),
    render: ({socketController, picState}) => { 
       return html`
        <style>
            :host {
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;

            }
            #pics-container {
                background-color: #fbf5fb;
                height: 90%;
                width: 90%;:
                display: flex;
                align-items: center;
                flex-direction: column;
            }
            .pic {
                max-width: 100%;
                height: 250px;
            }
        </style>
        <div id="pics-container">
            <div>
                <img class="pic" src="/api/random-image?key=${picState.key}-1&search=animal">
            </div>
            <div>
                <img class="pic" src="/api/random-image?key=${picState.key}-2&search=person">
            </div>
        </div>
     `
   }
}
