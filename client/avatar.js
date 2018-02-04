var Game = require('./avatar/game').default;
var config = require('./avatar/config').default;
var Stats = require('stats.js');

var game = new Game(config);
var stats = new Stats();
stats.showPanel(0);

var fullscreen = require('fullscreen');

console.log("Loading...");
var el = document.documentElement;

var startTime = null;

window.onload = function() {
    game.init();
    start();
}

function start() {
    /*
    document.getElementById('splash-container').style.display = "none";
    document.getElementById('game').appendChild(stats.dom);
    window.addEventListener('resize', resize, false);
    window.addEventListener('vrdisplaypresentchange', resize, true); */
    game.start();
    game.resize();
    stats.begin();
}

function resize() {
    game.resize();
}

