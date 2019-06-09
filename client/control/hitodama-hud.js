import { html, render,define } from 'hybrids';
import store, {changePhase, PHASE} from '../common/state'
import HitodamaVideo from './hitodama-video'
import HitodamaSpeech from './hitodama-speech'
import HitodamaTranscript from './hitodama-transcript'
import HitodamaControl from './hitodama-control'
import HitodamaPicsControl from '../common/hitodama-pics-control'

define('hitodama-video', HitodamaVideo);
define('hitodama-speech', HitodamaSpeech);
define('hitodama-transcript', HitodamaTranscript);
define('hitodama-control', HitodamaControl);
define('hitodama-pics-control', HitodamaPicsControl);

export default {
    render: ({state}) => html`
        <style>
            :host {
                width: 100%;
                height: 100%;
            }
            #hud-container {
              display: grid;
              height: 100%;
              padding: 20px;
              grid-template-columns:  50% 50% ;
              grid-template-rows:  auto 210px 80px;
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
                grid-row: 3;
                grid-column: 2; 
            }
            hitodama-control {
                grid-row: 2;
                grid-column: 2; 
            }
            hitodama-pics-control {
                grid-row: 2;
                grid-column: 1; 
            }
        </style>
        <div id="hud-container">
            <hitodama-video
                streamURL="${'http://127.0.0.1:8088/janus'}"
              >
             </hitodama-video>
            <hitodama-transcript>
            </hitodama-transcript>
            <hitodama-pics-control></hitodama-pics-control>
            <hitodama-control></hitodama-control>
            <hitodama-speech></hitodama-speech>
        </div>
     `
}

if (module.hot) {
    module.hot.accept('./hitodama-speech.js', function() {
        define('hitodama-speech', HitodamaSpeech);
    })
    module.hot.accept('./hitodama-video.js', function() {
        define('hitodama-video', HitodamaVideo);
    })
    module.hot.accept('./hitodama-transcript.js', function() {
        define('hitodama-transcript', HitodamaTranscript);
    })
    module.hot.accept('./hitodama-control.js', function() {
        define('hitodama-control', HitodamaControl);
    })
    module.hot.accept('../common/hitodama-pics-control.js', function() {
        define('hitodama-pics-control', HitodamaPicsControl);
    })
}
