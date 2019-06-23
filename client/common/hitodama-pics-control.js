import { html, render } from 'hybrids';
import store, {connect, PIC_STATE, PHASE, OTHER, ROLES, CHAMBERS} from './state'
import * as Hitodama from '../common/hitodama'

const readyClick = (host, event) => {
    event.preventDefault();
    ready(host);
}

const ready = (host) => {
    if (host.softbotState[OTHER[host.identity]]) {
        console.log("Ready!", host.identity);
        if (host.picState[host.identity] == PIC_STATE.WAITING) {
            host.socketController.send("SPIC" + String.fromCharCode(PIC_STATE.READY));
            if (host.identity == ROLES.CONTROLLER) {
                console.log("Open arms!");
                Hitodama.deflate(
                    host.socketController,
                    CHAMBERS.ARMS
                )
            }
        } else if (
            host.picState[host.identity] >= PIC_STATE.EXPLAIN_1 &&
            host.picState[host.identity] <= PIC_STATE.EXPLAIN_2
        ) {
            host.socketController.send("SPIC" + String.fromCharCode(host.picState[host.identity] + 2));
        }

    }
}

const getGuidelines = (picState, identity) => {
    const guidelines = [];
    let readyButton = false;

    if (picState[identity] == PIC_STATE.WAITING) {
        guidelines.push("READY FOR THE NEXT IMAGES ?")
        readyButton = true;
    }
    else if (picState[identity] == PIC_STATE.READY && picState[OTHER[identity]] == PIC_STATE.WAITING) {
        guidelines.push("Waiting for your partner to be ready...");
    }
    else if (picState[identity] == PIC_STATE.READY && picState[OTHER[identity]] >= PIC_STATE.READY) {
          guidelines.push("Choose your favorite image!");
    }
    else if (picState[identity] > PIC_STATE.READY && picState[OTHER[identity]] == PIC_STATE.READY) {
          guidelines.push("Waiting for partner to choose an image");
    }
    else if (picState[identity] >= PIC_STATE.READY &&  (picState[identity] - picState[OTHER[identity]]) % 2 == 0)  {
          guidelines.push("You chose the same image!");
    }
    else if (picState[identity] >= PIC_STATE.READY &&  (picState[identity] - picState[OTHER[identity]]) % 2 != 0) {
          guidelines.push("You chose a different image.");
    }
    if (picState[identity] >= PIC_STATE.EXPLAIN_1 && picState[identity] < PIC_STATE.DONE_1) {
          guidelines.push("Explain why you chose the image and press when ready");
          readyButton = true;
    }
    else if (picState[OTHER[identity]] >= PIC_STATE.EXPLAIN_1 && picState[OTHER[identity]] < PIC_STATE.DONE_1) {
          guidelines.push("Now the partner will explain why they chose their image");
    }
    
    return {guidelines, readyButton}
}


export default {
    socketController: connect(store, (state) => state.socketController),
    identity : "",
    picState: connect(store, (state) => state.picState),
    softbotState: connect(store, (state) => state.softbotState),
    phase: connect(store, (state) => state.phase),
    externalEvents: {
        set: (host, value, lastValue) => {
            console.log("Listen right arm release", value);
            value.on('arm-release', ({id}) => {
                if (id == 2) {
                    ready(host);
                }
            });
        }
    },
    render: ({socketController, identity, picState, softbotState, phase}) => { 
       return html`
        <style>
            :host {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;

            }
            #control-container {
                background-color: #fbf5fb;
                height: 100%;
                width: 100%;
                display: flex;
                align-items: center;
                flex-direction: row;
                justify-content: space-evenly;
            }
            .control-button {
                width: 70px;
                height: 65px;
                padding: 5px;
                background-color: #dfdbfb;
                border-style: solid;
                border-width: 1px;
                border-radius: 5px;
                box-shadow: 2px 2px gray;
                display:flex;
                font-size: 70px;
                color: #f46161;
            }
            .text-container {
                display: flex;
                flex-direction: column;
                justify-content: space-evenly;
                align-items: center;
                height: 100%;
            }
            #check-box {
                fill: green;
                height: 100%;
            }
            #hand-shake {
                fill: green;
                height: 100%;
            }
        </style>
        <div id="control-container">
            ${softbotState[OTHER[identity]] ? Object.entries(getGuidelines(picState, identity)).map(([key, value]) => 
                key == 'guidelines' ? html `
                    <div class="text-container">
                        ${value.map( line => html`<label>${line}</label>`)}
                    </div>
                ` : 
                key == 'readyButton' && value == true ? html`
                    <div>
                        <a onclick="${readyClick}" href="">
                            <div class="control-button">
                            ${identity == "CONTROL" && html`
                                <svg id="hand-shake" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"/></svg>
                            `}
                            ${identity == "AVATAR" && html`
                                <svg version="1.1" id="hand-shake" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 512.004 512.004" style="enable-background:new 0 0 512.004 512.004;" xml:space="preserve">
<g>
	<g>
		<g>
			<path d="M136.425,235.442c0,4.565,1.783,8.849,5.009,12.066l6.033,6.033c8.064,8.055,18.765,12.493,30.165,12.493
				c11.401,0,22.11-4.437,30.174-12.493l42.505-42.505c16.836,14.063,37.854,21.717,60.041,21.717h0.043
				c25.079-0.017,48.683-9.805,66.441-27.571c3.337-3.336,3.337-8.738,0-12.066c-3.337-3.337-8.73-3.337-12.066,0
				c-14.541,14.541-33.86,22.562-54.383,22.571h-0.026c-20.506,0-39.782-7.987-54.281-22.485c-3.337-3.328-8.738-3.328-12.066,0
				l-48.282,48.273c-9.66,9.668-26.53,9.668-36.198,0l-6.033-6.033l102.579-102.579c9.566-9.566,18.654-9.566,30.165-9.566
				c12.322,0,27.674,0,42.24-14.566l24.132-24.141c3.336-3.336,3.336-8.738,0-12.066c-3.328-3.337-8.73-3.337-12.066,0
				l-24.132,24.141c-9.574,9.566-18.662,9.566-30.174,9.566c-12.322,0-27.665,0-42.231,14.566L141.442,223.367
				C138.208,226.593,136.425,230.877,136.425,235.442z"/>
			<path d="M76.802,93.891c9.412,0,17.067-7.654,17.067-17.067c0-9.412-7.654-17.067-17.067-17.067
				c-9.412,0-17.067,7.654-17.067,17.067C59.735,86.237,67.39,93.891,76.802,93.891z"/>
			<path d="M159.533,120.797l24.132,24.132c1.672,1.673,3.857,2.5,6.033,2.5c2.185,0,4.369-0.828,6.033-2.5
				c3.337-3.328,3.337-8.73,0-12.066l-24.132-24.132c-3.328-3.336-8.73-3.336-12.066,0
				C156.205,112.059,156.205,117.46,159.533,120.797z"/>
			<path d="M435.202,59.758c9.404,0,17.067-7.654,17.067-17.067c0-9.412-7.663-17.067-17.067-17.067s-17.067,7.654-17.067,17.067
				C418.135,52.103,425.798,59.758,435.202,59.758z"/>
			<path d="M454.769,181.725c-13.867,13.867-18.628,36.454-23.228,58.3c-4.079,19.388-8.303,39.45-18.577,49.724l-12.075,12.066
				c-3.328,3.337-3.328,8.738,0,12.066c1.672,1.673,3.857,2.5,6.042,2.5c2.176,0,4.361-0.828,6.033-2.5l12.066-12.066
				c13.858-13.858,18.611-36.437,23.211-58.274c4.087-19.405,8.32-39.467,18.594-49.749c3.337-3.328,3.337-8.73,0-12.066
				C463.499,178.388,458.106,178.388,454.769,181.725z"/>
			<path d="M509.502,181.725L370.468,42.691l28.1-28.1c3.337-3.337,3.337-8.73,0-12.066c-3.337-3.336-8.73-3.336-12.066,0
				l-34.133,34.133c-3.337,3.337-3.337,8.73,0,12.066l145.067,145.067c1.664,1.664,3.849,2.5,6.033,2.5s4.369-0.836,6.033-2.5
				C512.838,190.454,512.838,185.061,509.502,181.725z"/>
			<path d="M316.418,253.541c-3.337-3.328-8.73-3.328-12.066,0c-3.336,3.337-3.336,8.738,0,12.075l90.505,90.505
				c6.656,6.656,6.656,17.485,0,24.141c-6.639,6.639-17.476,6.647-24.141,0l-90.505-90.513c-3.337-3.337-8.738-3.337-12.066,0
				c-3.337,3.337-3.337,8.738,0,12.066L382.79,416.46c6.656,6.656,6.656,17.485,0,24.132s-17.476,6.665-24.141,0.008
				L250.046,331.988c-3.337-3.337-8.738-3.337-12.066,0c-3.337,3.328-3.337,8.73,0,12.066l96.538,96.538
				c6.656,6.656,6.656,17.485,0,24.141c-6.451,6.451-17.681,6.451-24.132-0.008l-12.075-12.066h-0.009l-78.43-78.43
				c-3.337-3.336-8.738-3.336-12.066,0c-3.336,3.328-3.336,8.73,0,12.066l78.438,78.438c3.226,3.226,5.001,7.509,5.001,12.075
				c0,4.557-1.775,8.841-5.001,12.066c-6.639,6.639-17.476,6.656-24.132-0.009L116.969,343.858
				c-22.127-22.127-26.931-50.022-31.172-74.641c-3.567-20.71-6.938-40.269-20.028-53.359c-3.337-3.337-8.73-3.337-12.066,0
				s-3.337,8.73,0,12.066c9.259,9.259,12.049,25.446,15.275,44.194c4.437,25.771,9.967,57.847,35.925,83.806L250.046,500.94
				c6.647,6.647,15.386,9.984,24.132,9.984c8.738-0.009,17.485-3.337,24.132-9.984c4.847-4.855,8.064-10.906,9.361-17.493
				c12.51,6.033,28.8,3.482,38.912-6.647c4.855-4.855,8.064-10.914,9.361-17.502c12.689,6.093,28.407,3.866,38.912-6.639
				c13.312-13.303,13.312-34.953,0-48.265l-3.234-3.243c5.606-1.493,10.914-4.437,15.309-8.823c13.303-13.312,13.303-34.97,0-48.273
				L316.418,253.541z"/>
			<path d="M159.635,70.791l-51.2-51.2c-3.336-3.337-8.73-3.337-12.066,0c-3.337,3.336-3.337,8.73,0,12.066l45.167,45.167
				L2.502,215.858c-3.336,3.337-3.336,8.73,0,12.066c1.664,1.664,3.849,2.5,6.033,2.5s4.369-0.836,6.033-2.5L159.635,82.858
				C162.972,79.521,162.972,74.128,159.635,70.791z"/>
			<path d="M209.879,493.379c-4.753,2.492-12.868,2.79-20.181-4.506c-7.313-7.322-7.253-15.829-4.881-19.533
				c2.355-3.669,1.57-8.516-1.835-11.255c-3.388-2.739-8.294-2.483-11.383,0.614c-6.665,6.656-17.502,6.647-24.141,0
				c-6.647-6.656-6.647-17.485,0-24.141c1.673-1.664,2.5-3.849,2.5-6.033s-0.828-4.361-2.5-6.033c-3.328-3.328-8.73-3.328-12.066,0
				l-6.033,6.033c-6.647,6.656-17.485,6.656-24.132,0s-6.647-17.485,0-24.132l6.033-6.033c3.038-3.029,3.345-7.842,0.734-11.238
				c-2.611-3.396-7.347-4.326-11.042-2.185c-4.642,2.679-12.809,2.364-19.857-4.676c-7.492-7.492-7.458-15.795-5.043-19.294
				c2.679-3.874,1.698-9.19-2.176-11.87c-3.883-2.688-9.19-1.707-11.87,2.176c-6.903,10.001-6.716,27.315,7.023,41.054
				c5.41,5.402,11.298,8.627,17.101,10.172c-1.946,4.335-2.97,9.071-2.97,13.961c0,9.114,3.55,17.69,10.001,24.132
				c8.755,8.764,21.137,11.759,32.375,8.986c0.666,7.731,3.951,15.283,9.856,21.188c8.491,8.482,20.352,11.554,31.292,9.233
				c1.058,7.066,4.48,14.464,10.948,20.941c7.893,7.885,17.109,11.042,25.523,11.042c5.402,0,10.47-1.306,14.643-3.49
				c4.173-2.185,5.786-7.339,3.593-11.52C219.206,492.807,214.035,491.186,209.879,493.379z"/>
                        </g>
                    </g>
                </g>
                </svg>
                            `}
                            </div>
                        </a>
                    </div>
                ` : ''
                )
            :''}
            ${!softbotState[OTHER[identity]] && html`
                    <span>Waiting for partner</span>
            `}
        </div>
     `
   }
}
