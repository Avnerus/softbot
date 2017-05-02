import SimpleWebRTC from 'simplewebrtc'

export default class RTCController {
    constructor() {
        console.log("RTCControlller constructed!")
    }
    init() {
        let webrtc = new SimpleWebRTC({
            // the id/element dom element that will hold "our" video
            localVideoEl: 'client-local-video',
            // the id/element dom element that will hold remote videos
            remoteVideosEl: 'client-remote-videos',
            // immediately ask for camera access
            autoRequestMedia: true,
            url: document.URL
        })
        webrtc.on('readyToCall', function () {
            // you can name it anything
            webrtc.joinRoom('softbot');
        });
    }
}
