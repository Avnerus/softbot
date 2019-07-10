import { html, render } from 'hybrids';
import store, {connect, addTranscript} from '../common/state'
import '../common//language-select'
import Url from 'url-parse'

const play = (host, event) => {
    event.preventDefault();
    const form = event.target.closest("form");
    const link = form.querySelector('input[name="link"]').value;
    console.log("Play youtube link!", host, link);
    store.dispatch(addTranscript({
        from: "You",
        text: "Play youtube link: " + link,
        class: "gaze"
    }));

    try {
        const url = new Url(link, true);
        console.log(url);
        const id = url.query.v;
        if (typeof id == 'undefined' || id.length == 0) {
            throw new Error("Cannot parse this youtube link")
        }
        console.log("Video ID: ",id)

        host.socketController.sendJSONCommand({
            command: 'youtube',
            id: id,
        } );

        host.shadowRoot.querySelector("#youtube-visible input").checked = false;
    }
    catch(e) {
        store.dispatch(addTranscript({
            from: "Error",
            text: e.message
        }));
    }

    form.querySelector('input[name="link"]').value = "";
};
const stop = (host, event) => {
    event.preventDefault();
    console.log("Youtube stop!");
    host.socketController.sendJSONCommand({
        command: 'youtube',
        stop: true
    } );
    host.shadowRoot.querySelector("#youtube-visible input").checked = false;
};

const visible = (host, event) => {
    console.log("Visibility change", event.target.checked);
    host.socketController.sendJSONCommand({
        command: 'youtube',
        visible: event.target.checked
    } );
}

const volume = (host, event) => {
    console.log("volume change change", event.target.value);
    host.socketController.sendJSONCommand({
        command: 'youtube',
        volume: event.target.value
    } );
}


export default {
    socketController: connect(store, (state) => state.socketController),
    render: ({socketController}) => { 
       return html`
        <style>
            :host {
                display: flex;
            }
            #youtube-container {
                display: flex;
                align-items: center;
                height: 100%;
            }
            form {
                width: 100%;
            }
            #youtube-link {
                width: 55%
            }
            input[name="link"] {
                width: 100%;
                min-width: 0px;
            }
            button {
              border: none;
              color: white;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              font-size: 16px;
              cursor: pointer;
              padding: 10px;
              position: relative;
              top: 7px;
            }
            #play-button {
                margin-left: 15px;
                background-color: #664BEE;
            }
            #stop-button {
                margin-left: 5px;
                background-color: #f94444;
            }
            #youtube-visible {
                margin-left: 5px;
                display: flex;
                flex-direction: column;
                align-items: center;
                height: 50%;
            }
            #youtube-volume {
                margin-left: 5px;
                display: flex;
                flex-direction: column;
                align-items: center;
                height: 50%;
                margin-right: 5px;
            }
            #youtube-volume input {
                transform: rotate(270deg);
                width: 30px;
                position: relative;
                top: 5px;
            }
        </style>
        <form>
            <div id="youtube-container">
                    <div id="youtube-link">
                        <label>Youtube (link)</label>
                        <input name="link" type="text">
                    </div>
                    <button id="play-button" type="submit" onclick=${play} disabled=${socketController ? '' : 'disabled'}>Play</button>
                    <button id="stop-button" type="button" onclick=${stop} disabled=${socketController ? '' : 'disabled'}>Stop</button>
                    <div id="youtube-visible">
                        <label>Video:</label>
                        <input onchange=${visible} name="visible" type="checkbox">
                    </div>
                    <div id="youtube-volume">
                        <label>Vol:</label>
                        <input onchange=${volume} name="volume" type="range" min="1" max="100">
                    </div>
                </div>
        </form>
     `
   }
}
