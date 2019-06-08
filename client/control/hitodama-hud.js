import { html, render,define } from 'hybrids';
import store, {changePhase, PHASE} from './state'
import HitodamaVideo from './hitodama-video'
import HitodamaSpeech from './hitodama-speech'
import HitodamaTranscript from './hitodama-transcript'

define('hitodama-video', HitodamaVideo);
define('hitodama-speech', HitodamaSpeech);
define('hitodama-transcript', HitodamaTranscript);

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
              grid-template-columns:  55% 45% ;
              grid-template-rows:  auto 70px;
            }
            hitodama-transcript {
                grid-row: 1;
                grid-column: 2;
            }
            hitodama-video {
                grid-row: 1;
                grid-column: 1;
            }
            hitodama-speech {
                grid-row: 2;
                grid-column: 1;
            }
        </style>
        <div id="hud-container">
            <hitodama-transcript>
            </hitodama-transcript>
            <hitodama-video
                streamURL="${'http://127.0.0.1:8088/janus'}"
              >
             </hitodama-video>
             <hitodama-speech></hitodama-speech>
        </div>
     `
}
