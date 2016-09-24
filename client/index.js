var Game = require('./game').default;
var config = require('./config').default;
var Stats = require('stats.js');

var game = new Game(config);
var stats = new Stats();
stats.showPanel(0);

var fullscreen = require('fullscreen');

console.log("Loading...");
game.init();
var el = document.documentElement;

var startTime = null;

window.onload = function() {
    document.getElementById('start-button').addEventListener('click',function(event) {
        /*
           if (!Modernizr.touchevents && cdivinonfig = require('./config')nfig.controls == "locked" && lock.available()) {
            
            var pointer = lock(document.getElementById('game'));

            pointer.on('attain', function() {
                console.log("Pointer attained!");
                if (!game.started) {
                    start();
                }
                });

                pointer.request(); 
        }*/

        
        if (0 && fullscreen.available()) {
            var fs = fullscreen(el);

            fs.on('attain',function() {
                console.log("Full screen attained!");
                if (typeof(pointer) != 'undefined' && !game.started) {
                    pointer.request();
                } else {
                    if (!game.started) {
                        start();
                    }
                }
            });
            fs.request();
        } else {
            if (!game.started) {
                start();
            }
        }

        //start(); 
    });
    game.load(function() {
        /*
        document.getElementById('start-container').style.display = "flex";
        document.getElementById('loading-container').style.display = "none";*/
       start();
    });
}

function start() {
    document.getElementById('splash-container').style.display = "none";
    document.getElementById('game').appendChild(stats.dom);
    game.start();
    window.addEventListener('resize', resize, false);
    window.addEventListener('vrdisplaypresentchange', resize, true);
    game.resize();
    stats.begin();
    requestAnimationFrame(animate);
}


function animate(t) {
    if (!startTime) startTime = t;
    var dt = t - startTime;
    startTime = t;
    stats.begin();
    game.animate(dt);
    stats.end();
    requestAnimationFrame(animate);
}

function resize() {
    game.resize();
}

