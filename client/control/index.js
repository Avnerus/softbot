import '@webcomponents/webcomponentsjs/webcomponents-bundle.js';
import { define } from 'hybrids';

import ControlLayout from './control-layout'
import ControlRoot from './control-root'
import SignIn from './sign-in'

console.log("Loading control");

define('control-layout', ControlLayout);
define('control-root', ControlRoot);
define('sign-in', SignIn);
