import { html, render } from 'hybrids';
import store, {changePhase, PHASE} from './state'

import './language-select'

const signInClick = () => {
    store.dispatch(changePhase(PHASE.HUD))
} 

export default {
    render: ({state}) => html`
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

        </style>
        <div>
            <h1>Teleport to HITODAMA</h1>
            <div>
            <form>
				<div>
					<label>Name: </label>
					<input type="text" name="name">
				</div>
				<div class="language-field">
					<label> Preferred Language:  </label>
					<span class="language-select">
						<language-select languages=${['us','ar']}></language-select>
					</span>
				</div>
            </form>
        </div>
        <div id="teleport-button">
            <button onclick=${signInClick}>💫</button>
        </div>
     `
}
