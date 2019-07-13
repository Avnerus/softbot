import { html, render,define } from 'hybrids';
import store, {connect, changePhase, PHASE, ROLES, PIC_STATE} from '../common/state'
import HitodamaVideo from './hitodama-video'
import HitodamaSpeech from './hitodama-speech'
import HitodamaTranscript from './hitodama-transcript'
import HitodamaControl from './hitodama-control'
import HitodamaVisionControl from './hitodama-vision-control'
import HitodamaPicsControl from '../common/hitodama-pics-control'
import HitodamaPics from '../common/hitodama-pics'
import HitodamaYouTube from './hitodama-youtube'
import HitodamaArmControl from './hitodama-arm-control'
import HitodamaSense from './hitodama-sense'

define('hitodama-video', HitodamaVideo);
define('hitodama-speech', HitodamaSpeech);
define('hitodama-transcript', HitodamaTranscript);
define('hitodama-control', HitodamaControl);
define('hitodama-vision-control', HitodamaVisionControl);
define('hitodama-pics-control', HitodamaPicsControl);
define('hitodama-pics', HitodamaPics);
define('hitodama-youtube', HitodamaYouTube);
define('hitodama-arm-control', HitodamaArmControl);
define('hitodama-sense', HitodamaSense);

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
                phase == PHASE.HUD_PICS_VIDEO ? '200px 80px auto 105px 65px 80px;' : 'auto 105px 105px 80px;'
              }
            } 

            hitodama-transcript {
                grid-row: ${
                  phase == PHASE.HUD_PICS_VIDEO ? '1 / 4;' : '1;'
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
                  phase == PHASE.HUD_PICS_VIDEO ? '6;' : '4;'
                } 
                grid-column: 2; 
            }
            hitodama-youtube {
                display: ${
                    phase == PHASE.HUD_PICS ? 'none;' : 'flex;'
                }
                grid-row: ${
                  phase == PHASE.HUD_PICS_VIDEO ? '6;' : '4;'
                } 
                grid-column: 1; 
            }
            hitodama-control {
                grid-row: ${
                  phase == PHASE.HUD_PICS_VIDEO ? '4 / 6;' : '2 / 4;'
                } 
                grid-column: 2; 
            }
            hitodama-vision-control, hitodama-arm-control {
                --icon-size: ${
                      phase == PHASE.HUD_PICS_VIDEO ? '40px;' : '70px;'
                  }
            }             
            #below-camera {
                grid-row: 2;
                grid-column: 1; 
                display: flex;
                align-items: center;
                justify-content: space-evenly;
                width: 97%;
                background-color: #fbf5fb;
            }
            hitodama-pics-control {
                grid-row: ${
                  phase == PHASE.HUD_PICS_VIDEO && '5 ;'
                }
                ${
                  phase == PHASE.HUD_PICS && '4;'
                } 
                ${
                  phase == PHASE.HUD_NOPICS && '3;'
                } 

                grid-column: 1; 

                --icon-size: ${
                      phase == PHASE.HUD_PICS_VIDEO ? '40px;' : '70px;'
                 }
            }
            hitodama-pics {
                grid-row: ${
                    phase == PHASE.HUD_PICS_VIDEO ? '3 / 5;' : '1 / 4;'
                }
                grid-column: 1; 
                display: ${
                    phase == PHASE.HUD_NOPICS ? 'none;' : 'block;'
                }
                --max-pic-width-tall: ${
                    phase == PHASE.HUD_PICS_VIDEO ? '20vh;' : '34vh;'
                }
                --max-pic-width-wide: ${
                    phase == PHASE.HUD_PICS_VIDEO ? '20vh;' : '48vh;'
                }
            }
            hitodama-sense {
                position: absolute;
                width: 88%;
                height: 94%;
                top: 3%;
                left: 6%;
                pointer-events: none;
            }
            @media screen and (max-width: 800px) {
                #hud-container {
                    grid-template-columns: 50% 50%;
                    grid-template-rows: auto 130px 70px 90px 80px 80px;     
                }
                hitodama-transcript {
                    grid-row: 4;
                    grid-column: 1 / 3;
                }
                hitodama-video {
                    grid-row: 1;
                    grid-column: 1 / 3;
                }
                hitodama-speech {
                    grid-row: 6; 
                    grid-column: 1 / 3; 
                }
                hitodama-control {
                    grid-row: 2;
                    grid-column: 2;
                    --icon-size: 40px;
                }
                hitodama-pics-control {
                    grid-row: 3;
                    grid-column: 1 / 3; 
                    --icon-size: 30px;
                }
                hitodama-vision-control, hitodama-arm-control {
                    grid-row: 2;
                    grid-column: 1; 
                    --icon-size: 40px;
                    --button-direction: column;
                }
                hitodama-pics {
                    grid-row: 1;
                    grid-column: 1 / 3; 
                    --max-pic-width-tall: 40vw;
                    --max-pic-width-wide: 40vw;
                }
                hitodama-youtube {
                    grid-row: 5; 
                    grid-column: 1 / 3; 
                }
   
        </style>
        <div id="hud-container">
            <hitodama-video
                streamURL="${'https://stream.hitodama.online/janus'}"
              >
             </hitodama-video>
            <div id="below-camera">
                <hitodama-vision-control></hitodama-vision-control>
                <hitodama-arm-control></hitodama-arm-control>
            </div>
            <hitodama-pics identity=${'CONTROL'}></hitodama-pics>
            <hitodama-transcript>
            </hitodama-transcript>
            <hitodama-pics-control identity=${'CONTROL'}></hitodama-pics-control>
            <hitodama-control></hitodama-control>
            <hitodama-youtube></hitodama-youtube>
            <hitodama-speech></hitodama-speech>
            <hitodama-sense></hitodama-sense>
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
    module.hot.accept('./hitodama-youtube.js', function() {
        define('hitodama-youtube', HitodamaYouTube);
    })
    module.hot.accept('./hitodama-arm-control.js', function() {
        define('hitodama-arm-control', HitodamaArmControl);
    })
    module.hot.accept('./hitodama-sense.js', function() {
        define('hitodama-sense', HitodamaSense);
    })
}
