//import SimpleWebRTC from 'simplewebrtc'
var Main = require('./control/main').default;
console.log("Loading Control...");

window.onload = function() {
    var main = new Main();
    main.init();
}
