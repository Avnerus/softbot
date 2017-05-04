import Streamer from './streamer'

export default class Main {
    constructor() {
        console.log("Control Main constructed!")
    }
    init() {
        console.log("Conrol Main init ", document.host)
        this.streamer = new Streamer();
        this.streamer.init();
        /*
        let webrtc = new SimpleWebRTC({
            // the id/element dom element that will hold "our" video
            localVideoEl: 'control-local-video',
            // the id/element dom element that will hold remote videos
            remoteVideosEl: 'control-remote-videos',
            // immediately ask for camera access
            autoRequestMedia: true,
            url: document.location.protocol + "//" + document.location.host,
            media : {
                audio: false,
                video: false
            }
        })
        webrtc.on('readyToCall', function () {
            // you can name it anything
            console.log("Control joining room softbot")
            webrtc.joinRoom('softbot');
            });*/
    }
}
