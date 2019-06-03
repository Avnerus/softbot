//import SimpleWebRTC from 'simplewebrtc'
console.log("Loading Admin...");
let main = null;
let startTime = null;

import ('./admin/main')
.then((Main) => {

    main = new Main.default();
    main.init();
    console.log("Request animation?");

    requestAnimationFrame(animate);
})

function animate(t) {
    if (!startTime) startTime = t;
    var dt = t - startTime;
    startTime = t;
    main.animate(dt);
    requestAnimationFrame(animate);
}



