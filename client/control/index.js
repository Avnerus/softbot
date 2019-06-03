import '@webcomponents/webcomponentsjs/webcomponents-bundle.js';
import { define } from 'hybrids';

import ControlLayout from './control-layout'
import ControlRoot from './control-root'
import SignIn from './sign-in'

console.log("Loading control");

define('control-layout', ControlLayout);
define('control-root', ControlRoot);
define('sign-in', SignIn);

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

