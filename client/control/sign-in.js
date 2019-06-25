import { html, render } from 'hybrids';
import store, {connect, changePhase, setTranscribeTarget, PHASE} from '../common/state'

import '../common/language-select'

const signIn = (host, e) => {
    e.preventDefault();
    const transcribeTarget = e.target.querySelector("language-select").value;
    const name = e.target.querySelector('input[name="name"]').value;
    console.log("Sign in with transcribe target " + transcribeTarget + " and name " + name);

    host.socketController.send("R" + String.fromCharCode(0) + name);

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
                --size: 80px;
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

        </style>
        <div>
            <h1>Teleport to HITODAMA</h1>
            <div>
            <form onsubmit="${signIn}">
				<div>
					<label>Name: </label>
					<input required type="text" name="name">
				</div>
				<div class="language-field">
					<label> Preferred Language:  </label>
					<span class="language-select">
                        <language-select languages=${
                            [
                                {value: 'en', title: 'English', flag: 'us'},
                                {value: 'fi', title: 'Finnish', flag: 'fi'},
                                {value: 'ar', title: 'Arabic', flag: 'arx'},
                                {value: 'ca', title: 'Catalan', flag: 'catalonia'}
                            ]
                        }></language-select>
					</span>
				</div>
				<div id="teleport-button">
					<button type="submit" disabled=${socketController ? '' : 'disabled'}>💫</button>
				</div>
            </form>
        </div>
     `
}
