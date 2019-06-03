import { html } from 'hybrids';
import SignIn from './sign-in'

const STATE = {
    SIGN_IN: 1,
    CHOOSE_IMAGE: 2
}

export function changeState(host) {
    console.log("Change state!");
}

export default {
    state: STATE.SIGN_IN,
    render: ({state}) => html`
        <h1>Root</h1>
        ${state == STATE.SIGN_IN && html`<sign-in></sign-in>`}
        ${state == STATE.CHOOSE_IMAGE && html`<h1>choose image!</h1>`}

        <button onclick=${changeState}> Change state </button>
     `
}
