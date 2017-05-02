import SimpleWebRTC from 'simplewebrtc'

export default class Control {
    constructor() {
        console.log("Control constructed!")
    }
    init() {
        console.log("Conrol init ", document.host)
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
        });
    }
}
