import { html } from 'hybrids';
import SignIn from './sign-in'

const STATE = {
    SIGN_IN: 1,
    CHOOSE_IMAGE: 2
}

export function changeState(host) {
    console.log("Change state...");
    host.state = host.state == STATE.CHOOSE_IMAGE ? STATE.SIGN_IN : STATE.CHOOSE_IMAGE;
}

export default {
    state: STATE.SIGN_IN,
    render: (obj) => {
        console.log("Render with obj?", obj, obj.state);
        const state = obj.state;
        return html`
        <h1>Rootabgoooo</h1>
        ${state == STATE.SIGN_IN && html`<sign-in></sign-in>`}
        ${state == STATE.CHOOSE_IMAGE && html`<h1>choose image!</h1>`}

        <button onclick=${changeState}> Change state </button>
     `
}}
