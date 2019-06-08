import { html, render } from 'hybrids';
import store, {connect} from './state'
import './language-select'

const speak = (host, event) => {

};

export default {
    socketController: connect(store, (state) => state.socketController),
    render: ({socketController}) => { 
       return html`
        <style>
            language-select {
                display: inline-block;
            }
            #speech-container {
                display: flex;
                align-items: center;
                height: 100%;
            }
            form {
                width: 100%;
            }
            #speech-text {
                width: 80%
            }
            input[name="text"] {
                width: 87%;
                min-width: 0px;
            }
            #speech-language {
                display: flex;
                align-items: center;
            }
            #speech-language label {
                margin-right: 20px;                
            }
            button {
              border: none;
              color: white;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              font-size: 16px;
              cursor: pointer;
              background-color: #8A00FF;
              padding: 10px 32px;
              margin-left: 20px;
            }
        </style>
        <form>
            <div id="speech-container">
                    <div id="speech-text">
                        <label>Say: </label>
                        <input name="text" type="text">
                    </div>
                    <div id="speech-language">
                        <label>In: </label>
                        <language-select languages=${['us','ar']}></language-select>
                    </div>
                    <div id="speak-button">
                        <button type="submit" onclick=${speak} disabled=${socketController ? '' : 'disabled'}>Say</button>
                    </div>
            </div>
        </form>
     `
   }
}
