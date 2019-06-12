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

const getPicClass = (picState, id, identity) => 
    [  
        'image-container',
        picState[identity] == PIC_STATE.READY ? 'clickable' : ' ',
        picState[identity] == PIC_STATE['CHOSE_' + id] ||
        picState[identity] == PIC_STATE['EXPLAIN_' + id] ||
        picState[identity] == PIC_STATE['DONE_' + id] 
            ? 'chosen' : ' ',
        picState[identity] != PIC_STATE.READY &&
            (picState[OTHER[identity]] == PIC_STATE['CHOSE_' + id] ||
             picState[OTHER[identity]] == PIC_STATE['EXPLAIN_' + id]  ||
            picState[OTHER[identity]] == PIC_STATE['DONE_' + id] 
            )  ? 'other' : ' '
   ].filter( c => c != ' ')



const imageLoaded = (host, event) => {
    console.log("Image loaded!", host, event);
    let imageFlex = "column";
    $(host.shadowRoot).find("img").each((i, e) => {
        if (e.naturalHeight != 0 && e.naturalHeight > e.naturalWidth) {
            imageFlex = "row";
        }
    })
    host.imageFlex = imageFlex;
}

export default {
    socketController: connect(store, (state) => state.socketController),
    picState: connect(store, (state) => state.picState),
    identity: "",
    imageFlex: "row",
    render: ({socketController, picState, identity, imageFlex}) => { 
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
                ${imageFlex == "row" ?
                    html`
                    flex-direction: var(--pic-direction-row, row);
                ` : html`
                    flex-direction: var(--pic-direction-column, column);
                `}
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
            .image-container.other.chosen img {
                border-type: solid;
                box-shadow: 0px 0px 40px #a0a;
            }
            .pic {
                ${imageFlex == "row" ?
                    html`
                    max-width: var(--max-pic-width-row, 50vh);
                ` : html`
                    max-width: var(--max-pic-width-column, 50vh);
                `}
            }
        </style>
        ${picState[identity] > PIC_STATE.WAITING && picState[OTHER[identity]] > PIC_STATE.WAITING && html`
            <div id="pics-container">
                <div onclick=${chooseImage} class="${getPicClass(picState, 1, identity)}">
                    ${picState.key.length > 0 && html`
                        <img 
                            data-image-id="1"
                            onload="${imageLoaded}"
                            class="pic" 
                            src="/api/random-image?seed=${picState.key}&id=1"
                         ></img>
                    `}
                </div>
                <div onclick=${chooseImage} class="${getPicClass(picState, 2, identity)}">
                ${picState.key.length > 0 && html`
                    <img 
                        data-image-id="2"
                        onload="${imageLoaded}"
                        class="pic" 
                        src="/api/random-image?seed=${picState.key}&id=2"
                     >
                `}
                </div>
            </div>

        `}
     `
   }
}
