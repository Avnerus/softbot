import { html, render } from 'hybrids';
import store, {connect, changePhase, PHASE} from '../common/state'
import SignIn from './sign-in'

export default {
    phase: connect(store, (state) => state.phase),
    render: render(({phase}) => 
        html`
		<style>
			:host {
				display: inline-block;
				width: 100%;
				height: 100%;
			}
		</style>
			${phase == PHASE.SIGN_IN ? html`<sign-in></sign-in>` : html`<hitodama-hud></hitodama-hud>`}
     `, {shadowRoot :true})
}
