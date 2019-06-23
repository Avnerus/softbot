import { html, render } from 'hybrids';
import store, {connect, PIC_STATE, setTranscribSource} from '../common/state'

import '../common/language-select'

const langaugeChanged = (host, event) => {
    console.log("Langauge changed!", event.detail);
    store.dispatch(setTranscribSource(event.detail));
}
const languages =
    [
        {value: 'en-US', title: 'English', flag: 'us'},
        {value: 'fi-FI', title: 'Finnish', flag: 'fi'},
        {value: 'ar-IQ', title: 'Arabic', flag: 'arx'}
    ]
;

export default {
    softbotState: connect(store, (state) => state.softbotState),
    picState: connect(store, (state) => state.picState),
    recognizer: null,
    externalEvents: {
        set: (host, value, lastValue) => {
            console.log("Listen to left arm release", value);
            value.on('arm-release', ({id}) => {
                if (id == 1  && host.picState[host.identity] != PIC_STATE.READY) {
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
        }
    },
    render: ({softbotState}) => { 
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
        </style>
        <div id="avatar-container">
            <div id="speech-language">
                <label>I speak: </label>
                <language-select onchange="${langaugeChanged}" languages=${languages}>
                </language-select>
            </div>
            <div>
            ${softbotState.softControllerName.length > 0 ? html`
                    <span>Connected to:</span> <span class="controller-name">${softbotState.softControllerName}</span>
            ` : html`
                <span>Waiting for controller..</span>.
            `}
            </div>
        </div>
     `
   }
}
