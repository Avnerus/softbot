import('./avatar/index')
.then((Avatar) => {
    console.log("Loaded avatar", Avatar);
    let startTime = null;
    const avatar = new Avatar.default();
    avatar.init();
    avatar.start();
    avatar.resize();
    const animate = function(t) {
        if (!startTime) startTime = t;
        var dt = t - startTime;
        startTime = t;
        avatar.animate(dt);
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
})

    /*

var Stats = require('stats.js');
var stats = new Stats();
stats.showPanel(0);*/
