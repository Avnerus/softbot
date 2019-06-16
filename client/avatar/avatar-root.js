import { html, render } from 'hybrids';
import store, {connect} from '../common/state'

export default {
    softbotState: connect(store, (state) => state.softbotState),
    render: ({phase}) => 
        html`
		<style>
			:host {
				display: inline-block;
				width: 100%;
				height: 100%;
			}
		</style>
			${phase == PHASE.SIGN_IN ? html`<sign-in></sign-in>` : html`<hitodama-hud></hitodama-hud>`}
     `
