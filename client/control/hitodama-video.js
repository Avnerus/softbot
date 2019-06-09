import { html, render } from 'hybrids';
import store, {connect, PHASE} from '../common/state'
import Janus from './janus'
import adapter from 'webrtc-adapter';

import CameraPlaceholder from './images/camera_placeholder.jpg'

const getStream = (streaming) => {
    let body = { "request": "list"  };
    streaming.send({"message": body, success: (result) => {
        console.log("Stream list:", result.list);
        if (result.list.length > 0) {
           let stream  = result.list[0];
           console.log("Stream:", stream);
           let body = { "request": "watch", id: 1 }; 
           streaming.send({"message": body});
        }
    }});
}
const stopStream = (streaming) => {
    console.log("Stopping stream");
    let body = { "request": "stop" };
    streaming.send({"message": body});
    streaming.hangup();
}

const attach = (host, janus) => {
    let opaqueId = "softbotstream-"+Janus.randomString(12);
    console.log("Aquiring vision");
    let streaming = null;
    janus.attach({
            plugin: "janus.plugin.streaming",
            opaqueId: opaqueId,
            success: (pluginHandle) => {
                console.log("Janus attach success!");
                streaming = pluginHandle;
                getStream(streaming);
            },
            onmessage: (msg, jsep) => {
                //console.log("Janus message!", msg, jsep);
                let result = msg["result"];
                if(result) {
                    if(result["status"]) {
                        let status = result["status"];
                        if(status === 'starting')
                            console.log("Stream starting!"); 
                        else if(status === 'started')
                            console.log("Stream started!"); 
                        else if(status === 'stopped')
                            stopStream(streaming);
                    }
                } else if(msg["error"]) {
                    console.error("Stream Error", msg["error"]);
                    stopStream(streaming);
                    return;
                }
                if(jsep) {
                    // Answer
                    streaming.createAnswer({
                        jsep: jsep,
                        media: { audioSend: false, videoSend: false },	// We want recvonly audio/video
                        success: (jsep) => {
                            let body = { "request": "start" };
                            streaming.send({"message": body, "jsep": jsep});
                        },
                        error: function(error) {
                            console.error("WebRTC error:", error);
                        }
                    });
                }
            },
            onremotestream: (stream) => {
                console.log("Got remote stream!", stream);
                console.log("Vision acquired!");
                host.stream = stream;

                //Janus.attachMediaStream($('#waitingvideo').get(0), stream);

                /*
                if (this.recorder) {
                    //    this.recorder.initWithStream(stream);
                }*/
            },
            error: (error) => {
                //Janus.error(error);
                throw new "Janus attach Error" + error;
            }
    });
    /*
    $("#waitingvideo").bind("playing",  () => {
        console.log("Video playing!", this.stream, this.stream.currentTime);
        if (typeof(this.stream.currentTime) == 'undefined' || this.stream.currentTime > 1) {
            $("#loading").hide();
            $("#joystick").show();
            // For some reason this is needed for the joystick to start functioning
            window.dispatchEvent(new Event('resize'));
        }
    });*/
};

const metadataLoaded = (host, e) => {
    console.log("Video metadata loaded!");
    host.waiting = false;
    e.target.play();
}

export default {
    streamURL: {
        set: (host, value, lastValue) => {
          console.log("Init stream", value);
          const janusDeps = Janus.useDefaultDependencies({
                  adapter: adapter
          });
          Janus.init({debug: "none", dependencies: janusDeps, callback: () => {
              console.log("HMMMM",window.RTCPeerConnection, navigator.getUserMedia);
              if(!Janus.isWebrtcSupported()) {
                  throw "WebRTC Not supported!";
              }
              host.janus = new Janus(
                  {
                      server: value,
                      success: () => {
                          console.log("Janus Init success! Attaching to streaming plugin");
                          attach(host, host.janus);
                      },
                      error: (error) => {
                          //Janus.error(error);
                          throw "Janus Error " + error;
                      },
                      destroyed: () => {
                          console.log("Janus Destroyed!");
                      }
                  });
          }})
          return value;
        }
    },
    stream: null,
    waiting: true,
    phase: connect(store, (state) => state.phase),
    render: ({state, stream, waiting, phase}) => { 
       console.log("Rendering HITODAMA Video!");
       return html`
        <style>
            :host {
                display: inline-block;
                width: 100%;
                height: 100%;
            }
            #video-container {
                width: 100%;
                height: 100%;
            }
            video {
                width: 100%;
                height: auto;
            }
            .wait {
                padding: 20px;
                font-size: 100px;
                position: relative;
                left: 40%;
                top: 40%;
            }
            .placeholder {
                ${phase == PHASE.HUD_PICS_VIDEO ? 'height: 100%;' : 'width: 95%;'}
            }
        </style>
        <div id="video-container">
            ${stream && html`
                <video 
                    srcObject=${stream} 
                    id="hitodama-video"
                    onloadedmetadata=${metadataLoaded}
                ></video>
              `}
             ${waiting && html`
                <img class="placeholder" src=${CameraPlaceholder}>    
                <!--span class="wait">⌚️</span-->
             `}
        </div>
     `
   }
}
