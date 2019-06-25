import { define, html, render, dispatch } from 'hybrids'
import 'high-select/lib/high-select.js'

const languageChanged = (host, event) => {
    console.log("Language changed!", event.target.value);
    host.value = event.target.value;
    dispatch(host, 'change', { detail: host.value });
}

const LanguageSelect =  {
    flags : {},
    selected: {
        set: (host, value, lastValue) => {
          console.log("Set selected langauge to ", value);
          host.value = value;
          const highSelect = host.shadowRoot.querySelector("high-select");
          highSelect.value = value;
          dispatch(host, 'change', { detail: host.value });
          return value;
        }
    },
    languages: {
        set: (host, value, lastValue) => {
          const flags = {};
          value.forEach(async (lang) => {
            if (lang.flag == 'arx') {
                flags[lang.flag] = require(`./images/arx.svg`);
            }
            else if (lang.flag == 'catalonia') {
                flags[lang.flag] = require(`./images/catalonia.svg`);
            } else {
                flags[lang.flag] = require(`svg-country-flags/svg/${lang.flag}.svg`);
            }
          })
          host.flags = flags;
          host.value = value[0].value;
          return value;
        }
    },
    render: ({languages, flags}) => html`
    <style>
        .option-container {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
       .option-container img { 
           width: var(--size, 60px);
           padding-bottom: 5px;
       }
       .option-container div { 
           width: 100%;
           background-color: #fffbfb82;
           width: var(--size, 60px);
       }
       high-select {
           width: var(--size, 60px);
           text-align: center;
       }
    </style>
    <high-select onchange="${languageChanged}" class="option-container">
        ${languages.map(language => html`
            <high-option value="${language.value}"> 
                <div class="option-container">
                    <div>${language.title}</div>
                    <img src=${flags[language.flag]}>
                </div>
            </high-option>`
        )}
    </high-select>
   `
}

define('language-select', LanguageSelect);


