import { html, render } from 'hybrids';
import store, {connect, PIC_STATE, setTranscribSource, ROLES} from '../common/state'

import '../common/language-select'

const langaugeChanged = (host, event) => {
    console.log("Langauge changed!", event.detail);
    store.dispatch(setTranscribSource(event.detail));
}
const languages =
    [
        {value: 'en-US', title: 'English', flag: 'us'},
        {value: 'fi-FI', title: 'Finnish', flag: 'fi'},
        {value: 'ar-IQ', title: 'Arabic', flag: 'arx'},
        {value: 'he-IL', title: 'Hebrew', flag: 'il'},
        {value: 'ca-ES', title: 'Catalan ', flag: 'catalonia'}
    ]
;

const refresh = (host, event) => {
    event.preventDefault();
    console.log("Refresh!");
    window.location.reload();
}
const transcribe = (host, event) => {
    event.preventDefault();
    console.log("Transcribe!");
    const languageSelect = host.shadowRoot.querySelector("language-select");
    host.externalEvents.emit("start-recognizing", {source: languageSelect.value});
}

export default {
    softbotState: connect(store, (state) => state.softbotState),
    picState: connect(store, (state) => state.picState),
    recognizer: null,
    transcriptionResult: connect(store, (state) => state.transcriptionResult),
    transcribeSource: connect(store, (state) => state.transcribeSource),
    externalEvents: {
        set: (host, value, lastValue) => {
            console.log("Listen to left arm release", value);
            value.on('arm-release', ({id}) => {
                if (id == 1  && host.picState[ROLES.AVATAR] != PIC_STATE.READY) {
                    console.log("Cycle language!");
                    const langaugeSelect = host.shadowRoot.querySelector("language-select");
                    const currentIndex = languages.findIndex((e) => e.value == langaugeSelect.value);
                    let newIndex = null;

                    if (currentIndex == languages.length -1) {
                        newIndex = 0;
                    } else {
                       newIndex = currentIndex + 1;
                    }

                    langaugeSelect.selected = languages[newIndex].value;
                }
            });
            value.on('arm-long-press', () => {
                console.log("Long press!");
                const languageSelect = host.shadowRoot.querySelector("language-select");
                value.emit("start-recognizing", {source: languageSelect.value});
            })

            return value;
        }
    },
    render: ({softbotState, transcriptionResult, transcribeSource}) => { 
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
                height: 90px;
                font-size: 20px;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-around;
            }
            .controller-name {
                color: red;
            }
            #speech-language {
                display: flex;
                align-items: center;
            }
            #speech-language label {
                width: 100px;
            }
            language-select {
                --size: 70px;
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
                font-size: 65px;
                color: #f46161;
                align-items: center;
                justify-content: center;
                text-decoration: none;
            }
            .control-button span {
                position: relative;
                bottom: 3px;
            }
            #transcription {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: yellow;
                font-weight: bold;
                font-size: 32px;
            }
        </style>
        <div id="avatar-container">
            ${transcriptionResult ? html`
                <div id="transcription">
                    ${transcriptionResult.transcription}
                </div>
            ` : html`
                <div id="speech-language">
                    <label>I speak: </label>
                    <language-select onchange="${langaugeChanged}" initial="${transcribeSource}" languages=${languages}>
                    </language-select>
                </div>
                <div id="refresh">
                    <a onclick="${refresh} "href="" class="control-button">
                        <span>R</span>
                    </a>
                </div>
                <div id="transcribe">
                    <a onclick="${transcribe} "href="" class="control-button">
                        <span>T</span>
                    </a>
                </div>
                <div>
                ${softbotState.softControllerName.length > 0 ? html`
                        <span>Connected to:</span> <span class="controller-name">${softbotState.softControllerName}</span>
                ` : html`
                    <span>Waiting for controller..</span>.
                `}
                </div>
            `}
        </div>
     `
   }
}
