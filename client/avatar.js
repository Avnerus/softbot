var Avatar = require('./avatar/index').default;
var config = require('./avatar/config').default;
var Stats = require('stats.js');

var avatar = new Avatar(config);
var stats = new Stats();
stats.showPanel(0);

var fullscreen = require('fullscreen');

console.log("Loading...");
var el = document.documentElement;

var startTime = null;

window.onload = function() {
    avatar.init();
    start();
}

function start() {
    /*
    document.getElementById('splash-container').style.display = "none";
    document.getElementById('game').appendChild(stats.dom);
    window.addEventListener('resize', resize, false);
    window.addEventListener('vrdisplaypresentchange', resize, true); */
    avatar.start();
    avatar.resize();
    stats.begin();
}

function resize() {
    avatar.resize();
}

