import '@webcomponents/webcomponentsjs/webcomponents-bundle.js';
import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js';


import { define } from 'hybrids';

import ControlLayout from './control-layout'
import ControlRoot from './control-root'
import SignIn from './sign-in'


define('control-layout', ControlLayout);
define('control-root', ControlRoot);
define('sign-in', SignIn);

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
}

