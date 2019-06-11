import { html, render } from 'hybrids';
import store, {connect, setPicState, PIC_STATE, OTHER} from './state'

const ready = (host, event) => {
    event.preventDefault();
    console.log("Ready!");
    host.socketController.send("SPIC" + String.fromCharCode(PIC_STATE.READY));
}

const chooseImage = (host, event) => {
    event.preventDefault();
    if (host.picState[host.identity] == PIC_STATE.READY) {
        console.log("Choose image!", event.target);
        const chosenId = $(event.target).attr("data-image-id");
        if (chosenId == '1') {
            host.socketController.send("SPIC" + String.fromCharCode(PIC_STATE.CHOSE_1));
        } else {
            host.socketController.send("SPIC" + String.fromCharCode(PIC_STATE.CHOSE_2));
        }
    }
    else {
        console.log("Cannot choose now!");
    }
}


export default {
    socketController: connect(store, (state) => state.socketController),
    picState: connect(store, (state) => state.picState),
    identity: "",
    render: ({socketController, picState, identity}) => { 
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
                height: 97%;
                width: 97%;
                display: flex;
                align-items: center;
                flex-direction: var(--pic-direction, column);
                justify-content: space-evenly;
                margin-top: 5px;
            }
            .image-container {
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 10px;
                height: 100%;
            }  
            .image-container.clickable img:hover {
                border-type: solid;
                box-shadow: 0px 0px 7px #f00;
            }
            .image-container.clickable img {
                cursor: pointer;
            }
            .image-container.chosen img {
                border-type: solid;
                box-shadow: 0px 0px 20px #0f0;
            }
            .image-container.other img {
                border-type: solid;
                box-shadow: 0px 0px 20px #00f;
            }
            .pic {
                max-width: var(--max-pic-width, 50vh);
            }
        </style>
        <div id="pics-container">
            <div onclick=${chooseImage} class="image-container ${
                picState[identity] == PIC_STATE.READY ? 'clickable' :
                picState[identity] == PIC_STATE.CHOSE_1 ? 'chosen' : ''
             } ${
                 picState[identity] != PIC_STATE.READY && picState[OTHER[identity]] == PIC_STATE.CHOSE_1 ? 'other' : ''
             }">
                ${picState.key.length > 0 && html`
                    <img 
                        data-image-id="1"
                        class="pic" 
                        src="/api/random-image?key=${picState.key}-1&search=animal"
                     ></img>
                `}
            </div>
            <div onclick=${chooseImage} class="image-container ${
                picState[identity] == PIC_STATE.READY ? 'clickable ' :
                picState[identity] == PIC_STATE.CHOSE_2 ? 'chosen' : ''
             } ${
                 picState[identity] != PIC_STATE.READY && picState[OTHER[identity]] == PIC_STATE.CHOSE_2 ? 'other' : ''
             }">
            ${picState.key.length > 0 && html`
                <img 
                    data-image-id="2"
                    class="pic" 
                    src="/api/random-image?key=${picState.key}-2&search=person"
                 >
            `}
            </div>
        </div>
     `
   }
}
