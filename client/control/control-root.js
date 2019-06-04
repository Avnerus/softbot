import { html, render } from 'hybrids';
import store, {connect, PHASE} from './state'
import SignIn from './sign-in'


export default {
    phase: connect(store, (state) => state.phase),
    render: render(({phase}) => 
        html`
        ${phase == PHASE.SIGN_IN && html`<sign-in></sign-in>`}
        ${phase == PHASE.CHOOSE_IMAGE && html`<h1>choose image!</h1>`}
     `, {shadowRoot: false})
}
