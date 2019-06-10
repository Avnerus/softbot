import { html, render } from 'hybrids';
import store, {connect, setPicState, PIC_STATE} from './state'

const ready = (host, event) => {
    event.preventDefault();
    console.log("Ready!");
    host.socketController.send("SPIC" + String.fromCharCode(PIC_STATE.READY));
}

const chooseImage = (host, event) => {
    event.preventDefault();
    console.log("Choose image!", event.target);
    const chosenId = $(event.target).attr("data-image-id");
    if (chosenId == '1') {
        host.socketController.send("SPIC" + String.fromCharCode(PIC_STATE.CHOSE_1));
    } else {
        host.socketController.send("SPIC" + String.fromCharCode(PIC_STATE.CHOSE_2));
    }

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
                height: 100%;
                width: 95%;
                display: flex;
                align-items: center;
                flex-direction: var(--pic-direction, column);
                justify-content: space-evenly;
            }
            .image-container {
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 10px;
            }  
            .image-container:hover {
                border-type: solid;
                box-shadow: 0px 0px 7px #f00;
            }
            .pic {
                max-width: var(--max-pic-width, 100%);
                max-height: var(--max-pic-height, 260px);
            }
        </style>
        <div id="pics-container">
            <a href=""  onclick=${chooseImage}>
                <div class="image-container">
                    ${picState.key.length > 0 && html`
                        <img data-image-id="1"class="pic" src="/api/random-image?key=${picState.key}-1&search=animal">
                    `}
                </div>
            </a>
            <a href=""  onclick=${chooseImage}>
                <div class="image-container">
                    ${picState.key.length > 0 && html`
                        <img data-image-id="2" class="pic" src="/api/random-image?key=${picState.key}-2&search=person">
                    `}
                </div>
            </a>
        </div>
     `
   }
}
