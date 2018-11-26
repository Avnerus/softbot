//import SimpleWebRTC from 'simplewebrtc'
console.log("Loading Control...");
import ('./control/main')
.then((Main) => {
    const main = new Main.default();
    main.init();
})

var startTime = null;
/*

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
*/
