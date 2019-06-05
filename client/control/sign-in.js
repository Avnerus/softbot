import { html, render } from 'hybrids';
import store, {changePhase, PHASE} from './state'

import './language-select'

const signInClick = () => {
    console.log("Trying to change phase!!");
    store.dispatch(changePhase(PHASE.CHOOSE_IMAGE))
} 

export default {
    render: ({state}) => html`
        <style>
            :host {
                width: 600px;
                height: 600px;
                background-color: orange;
                display: block;

                display: flex;
                align-items: center;
                flex-direction: column;
            }
            .language-select {
                width: 300px;
            }
        </style>
        <div>
            <h1>Welcome</h1>
        </div>
        <div class="language-select">
            <language-select languages=${['us','ar']}></language-select>
        </div>
        <div>
            <button onclick=${signInClick}> Change phase </button>
        </div>
     `
}
