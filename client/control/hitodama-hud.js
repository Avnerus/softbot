import { html, render,define } from 'hybrids';
import store, {changePhase, PHASE} from './state'
import HitodamaVideo from './hitodama-video'


define('hitodama-video', HitodamaVideo);

export default {
    render: ({state}) => html`
        <style>
            :host {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            #hud-container {
              display: grid;
              width: 95%;
              height: 95%;
              grid-template-columns:  50% 50% ;
              grid-template-rows:  80% 20% ;
            }
            hitodama-video {
                grid-row: 1;
                grid-column: 1;
            }
        </style>
        <div id="hud-container">
            <hitodama-video
                streamURL="${'http://127.0.0.1:8088/janus'}"
              >
             </hitodama-video>
        </div>
     `
}
