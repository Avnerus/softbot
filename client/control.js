//import SimpleWebRTC from 'simplewebrtc'
console.log("Loading Control...");
import Main from './control/main';
const main = new Main();

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

