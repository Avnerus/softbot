import { html, render, define } from 'hybrids';
import store, {connect} from '../common/state'
import HitodamaPicsControl from '../common/hitodama-pics-control'
import HitodamaPics from '../common/hitodama-pics'
import HitodamaAvatar from './hitodama-avatar'

define('hitodama-pics-control', HitodamaPicsControl);
define('hitodama-pics', HitodamaPics);
define('hitodama-avatar', HitodamaAvatar);


export default {
    softbotState: connect(store, (state) => state.softbotState),
    render: ({phase}) => 
        html`
		<style>
			:host {
				display: inline-block;
				width: 100%;
				height: 100%;
			}
            .pics-control {
                height: 100px;
                font-size: 20px;
            }

            hitodama-pics {
                --pic-direction-wide: row;
                --pic-direction-tall: row;
                --max-pic-width-wide: 45vw;
                --max-pic-width-tall: 45vh;
            }

            .avatar-control {
                position: absolute;
                bottom: 0;
                width: 100%;
            }
		</style>
        <div class="pics-control">
            <hitodama-pics-control externalEvents="${events}" identity="AVATAR"></hitodama-pics-control>
        </div>
        <div class="pics">
            <hitodama-pics externalEvents="${events}" identity="AVATAR"></hitodama-pics>
        </div>
        <div class="avatar-control">
            <hitodama-avatar externalEvents="${events}"></hitodama-avatar>
        </div>
     `
}
