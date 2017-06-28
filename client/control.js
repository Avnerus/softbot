//import SimpleWebRTC from 'simplewebrtc'
console.log("Loading Control...");
var Main = require('./control/main').default;
var main = new Main();

var startTime = null;

window.onload = function() {
    main.init();
    requestAnimationFrame(animate);
}

function animate(t) {
    if (!startTime) startTime = t;
    var dt = t - startTime;
    startTime = t;
    main.animate(dt);
    requestAnimationFrame(animate);
}

