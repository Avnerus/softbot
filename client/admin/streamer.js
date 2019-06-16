import _ from 'lodash'

export default class Streamer {
    constructor(recorder) {
        console.log("Streamer constructed!");
        this.recorder = recorder;
    }
    init() {
        console.log("Streamer init");
        events.on("janus_connected", (janus) => {
            this.janus = janus;
            let opaqueId = "softbotstream-"+Janus.randomString(12);
            events.emit("transcript", {from: "System", text: "Acquiring vision..."});
            this.janus.attach({
                    plugin: "janus.plugin.streaming",
                    opaqueId: opaqueId,
                    success: (pluginHandle) => {
                        console.log("Janus attach success!");
                        this.streaming = pluginHandle;
                        this.getStream();
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
                                    this.stopStream();
                            }
                        } else if(msg["error"]) {
                            console.error("Stream Error", msg["error"]);
                            this.stopStream();
                            return;
                        }
                        if(jsep) {
                            // Answer
                            this.streaming.createAnswer({
                                jsep: jsep,
                                media: { audioSend: false, videoSend: false },	// We want recvonly audio/video
                                success: (jsep) => {
                                    let body = { "request": "start" };
                                    this.streaming.send({"message": body, "jsep": jsep});
                                },
                                error: function(error) {
                                    console.error("WebRTC error:", error);
                                }
                            });
                        }
                    },
                    onremotestream: (stream) => {
                        console.log("Got remote stream!", stream);
                        this.stream = stream;
                        events.emit("transcript", {from: "System", text: "Vision acquired!"});
                        Janus.attachMediaStream($('#waitingvideo').get(0), stream);

                        if (this.recorder) {
                            this.recorder.initWithStream(this.streaming, stream);
                        }
                    },
                    error: (error) => {
                        //Janus.error(error);
                        throw new "Janus attach Error" + error;
                    }
            });
            $("#waitingvideo").bind("playing",  () => {
                console.log("Video playing!", this.stream, this.stream.currentTime);
                if (typeof(this.stream.currentTime) == 'undefined' || this.stream.currentTime > 1) {
                    $("#loading").hide();
                    $("#joystick").show();
                    // For some reason this is needed for the joystick to start functioning
                    window.dispatchEvent(new Event('resize'));
                }
            });
        });
    }

    getStream() {
        let body = { "request": "list"  };
        this.streaming.send({"message": body, success: (result) => {
            console.log("Stream list:", result.list);
            let stream = _.find(result.list, {id: 1});
            if (stream) {
               console.log("Stream:", stream);
               let body = { "request": "watch", id: 1 }; 
               this.streaming.send({"message": body});
            }
        }});
    }
    stopStream() {
        console.log("Stopping stream");
        let body = { "request": "stop" };
        this.streaming.send({"message": body});
        this.streaming.hangup();

    }
}
