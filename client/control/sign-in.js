import { html, render } from 'hybrids';
import store, {connect, changePhase, setTranscribeTarget, PHASE} from '../common/state'

import '../common/language-select'

const languages = 
    [
        {value: 'en', title: 'English', flag: 'us'},
        {value: 'fi', title: 'Finnish', flag: 'fi'},
        {value: 'sv', title: 'Swedish', flag: 'se'},
        {value: 'ru', title: 'Russian', flag: 'ru'},
        {value: 'ar', title: 'Arabic', flag: 'arx'},
        {value: 'tr', title: 'Turkish', flag: 'tr'},
        {value: 'es', title: 'Spanish (Mexico)', flag: 'mx'},
        {value: 'so', title: 'Somali', flag: 'so'},
        {value: 'de', title: 'German', flag: 'de'},
        {value: 'he', title: 'Hebrew', flag: 'il'},
        {value: 'ca', title: 'Catalan', flag: 'catalonia'},
        {value: 'fa', title: 'Persian', flag: 'ir'}
    ]
;

const signIn = (host, e) => {
    e.preventDefault();
    const transcribeTarget = e.target.querySelector("language-select").value;
    const transcribeTitle = languages.find(e => e.value == transcribeTarget).title;

    const name = e.target.querySelector('input[name="name"]').value;
    console.log("Sign in with transcribe target " + transcribeTarget + ", name: " + name + ", title: " + transcribeTitle);

    host.socketController.send("R" + String.fromCharCode(0) + name + " (Speaks: " + transcribeTitle + ")");

    store.dispatch(setTranscribeTarget(transcribeTarget));
    store.dispatch(changePhase(PHASE.HUD_NOPICS))
} 

export default {
    socketController: connect(store, (state) => state.socketController),
    render: ({socketController}) => html`
        <style>
            :host {
                display: flex;
                align-items: center;
                flex-direction: column;
            }
			h1 {
				margin-bottom: 40px;
			}
			label {
				width: 20vw;
				display: inline-block;
			}
            .language-select {
                width: 300px;
				display: inline-block;
            }
            language-select {
				display: inline-block;
				padding-left: 12px;
            }
			.language-field {
				display: flex;
				align-items: center;
			}
			form > div {
				margin-top: 15px;
			}
			#teleport-button {
				margin-top: 30px;
			}
			button {
				width: 100px;
				height: 100px;
				font-size: 50px;
				margin-left: 20vw;
				background-color: rebeccapurple;
			}
            button:disabled {
                background-color: #04040466;
                color: #0000003d;
                cursor: not-allowed;
            }

            #sign-in-container {
                width: 100%;
                margin-left: 20px;
            }

        </style>
        <div id="sign-in-container">
            <h1>Teleport to HITODAMA</h1>
            <div>
            <form onsubmit="${signIn}">
				<div>
					<label>Name: </label>
					<input required type="text" name="name">
				</div>
				<div class="language-field">
					<label> Native tounge:  </label>
					<span class="language-select">
                        <language-select languages=${languages}></language-select>
					</span>
				</div>
				<div id="teleport-button">
					<button type="submit" disabled=${socketController ? '' : 'disabled'}>💫</button>
				</div>
            </form>
        </div>
     `
}
