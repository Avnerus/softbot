import { html, render,define } from 'hybrids';
import store, {connect, changePhase, PHASE, ROLES, PIC_STATE} from '../common/state'
import HitodamaVideo from './hitodama-video'
import HitodamaSpeech from './hitodama-speech'
import HitodamaTranscript from './hitodama-transcript'
import HitodamaControl from './hitodama-control'
import HitodamaVisionControl from './hitodama-vision-control'
import HitodamaPicsControl from '../common/hitodama-pics-control'
import HitodamaPics from '../common/hitodama-pics'

define('hitodama-video', HitodamaVideo);
define('hitodama-speech', HitodamaSpeech);
define('hitodama-transcript', HitodamaTranscript);
define('hitodama-control', HitodamaControl);
define('hitodama-vision-control', HitodamaVisionControl);
define('hitodama-pics-control', HitodamaPicsControl);
define('hitodama-pics', HitodamaPics);

export default {
    phase: connect(store, (state) => state.phase),
    render: ({phase}) => html`
        <style>
            :host {
                width: 100%;
                height: 100%;
            }
            #hud-container {
              display: grid;
              height: 100%;
              padding: 0px 10px;
              grid-template-columns:  50% 50% ;
              grid-template-rows: ${
                phase == PHASE.HUD_PICS_VIDEO ? '200px auto 105px 105px 80px;' : 'auto 105px 105px 80px;'
              } 
            }
            hitodama-transcript {
                grid-row: ${
                  phase == PHASE.HUD_PICS_VIDEO ? '1 / 3;' : '1;'
                } 
                grid-column: 2;
            }
            hitodama-video {
                grid-row: 1;
                grid-column: 1;
                display: ${
                    phase == PHASE.HUD_PICS ? 'none;' : 'block;'
                }
            }
            hitodama-speech {
                grid-row: ${
                  phase == PHASE.HUD_PICS_VIDEO ? '5;' : '4;'
                } 
                grid-column: 2; 
            }
            hitodama-control {
                grid-row: ${
                  phase == PHASE.HUD_PICS_VIDEO ? '3 / 5;' : '2 / 4;'
                } 
                grid-column: 2; 
            }
            hitodama-vision-control {
                grid-row: ${
                  phase == PHASE.HUD_PICS_VIDEO ? '3;' : '2;'
                } 
                grid-column: 1; 
            }
            hitodama-pics-control {
                grid-row: ${
                  phase == PHASE.HUD_PICS_VIDEO && '4 ;'
                }
                ${
                  phase == PHASE.HUD_PICS && '4;'
                } 
                ${
                  phase == PHASE.HUD_NOPICS && '3;'
                } 

                grid-column: 1; 
            }
            hitodama-pics {
                grid-row: ${
                    phase == PHASE.HUD_PICS_VIDEO ? '2 / 4;' : '1 / 4;'
                }
                grid-column: 1; 
                display: ${
                    phase == PHASE.HUD_NOPICS ? 'none;' : 'block;'
                }
                --max-pic-width-tall: ${
                    phase == PHASE.HUD_PICS_VIDEO ? '20vh;' : '34vh;'
                }
                --max-pic-width-wide: ${
                    phase == PHASE.HUD_PICS_VIDEO ? '30vh;' : '48vh;'
                }
            }
        </style>
        <div id="hud-container">
            <hitodama-video
                streamURL="${'http://stream.hitodama.online/janus'}"
              >
             </hitodama-video>
            <hitodama-vision-control></hitodama-vision-control>
            <hitodama-pics identity=${'CONTROL'}></hitodama-pics>
            <hitodama-transcript>
            </hitodama-transcript>
            <hitodama-pics-control identity=${'CONTROL'}></hitodama-pics-control>
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
    module.hot.accept('../common/hitodama-pics.js', function() {
        define('hitodama-pics', HitodamaPics);
    })
}
