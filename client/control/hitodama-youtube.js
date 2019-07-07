import { html, render } from 'hybrids';
import store, {connect, addTranscript} from '../common/state'
import '../common//language-select'
import Url from 'url-parse'

const play = (host, event) => {
    event.preventDefault();
    const form = event.target.closest("form");
    const link = form.querySelector('input[name="link"]').value;
    console.log("Youtube link!", link);
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
};


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
                width: 70%
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
        </style>
        <form>
            <div id="youtube-container">
                    <div id="youtube-link">
                        <label>Play youtube link: </label>
                        <input name="link" type="text">
                    </div>
                    <button id="play-button" type="submit" onclick=${play} disabled=${socketController ? '' : 'disabled'}>Play</button>
                    <button id="stop-button" type="button" onclick=${stop} disabled=${socketController ? '' : 'disabled'}>Stop</button>
                </div>
        </form>
     `
   }
}
