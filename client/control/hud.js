import { html, render } from 'hybrids';
import store, {changePhase, PHASE} from './state'

export default {
    render: ({state}) => html`
        <style>
            :host {
                display: inline-block;
                width: 100%;
                height: 100%;
            }
            #hud-container {
              display: grid;
              width: 100%;
              height: 100%;
              grid-template-columns: 20px auto auto 20px;
              grid-template-rows: 10px 80% auto 10px;
            }
        </style>
        <div id="hud-container">
            <h1>HUD</h1>
        </div>
     `
}
