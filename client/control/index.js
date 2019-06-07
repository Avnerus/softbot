import '@webcomponents/webcomponentsjs/webcomponents-bundle.js';
//import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js';

import { define } from 'hybrids';
import ControlLayout from './control-layout'
import ControlRoot from './control-root'
import SignIn from './sign-in'
import HitodamaHUD from './hitodama-hud'


define('control-layout', ControlLayout);
define('control-root', ControlRoot);
define('sign-in', SignIn);
define('hitodama-hud', HitodamaHUD);

console.log("Loading control");

if (module.hot) {
    console.log("We have hot");
    module.hot.accept('./control-root.js', function() {
        define('control-root', ControlRoot);
    })
    module.hot.accept('./sign-in.js', function() {
        define('sign-in', SignIn);
    })
    module.hot.accept('./control-layout.js', function() {
        define('control-layout', ControlLayout);
    })
    module.hot.accept('./hitodama-hud.js', function() {
        define('hitodama-hud', HitodamaHUD);
    })
}

