import { define, html, render } from 'hybrids'
import 'high-select/lib/high-select.js'

const LanguageSelect =  {
    flags : {},
    languages: {
        set: (host, value, lastValue) => {
          console.log("Set languages?", value);
          const flags = {};
          value.forEach(async (lang) => {
            flags[lang] = require(`svg-country-flags/svg/${lang}.svg`);
          })
          host.flags = flags;
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
           width: var(--size, 50px);
           padding-bottom: 5px;
       }
       .option-container div { 
           width: 100%;
           background-color: #fffbfb82;
           width: var(--size, 50px);
       }
       high-select {
           width: var(--size, 50px);
           text-align: center;
       }
    </style>
    <high-select class="option-container">
        ${Object.keys(flags).map(flag => html`
            <high-option> 
                <dia class="option-container">
                    <div>${flag}</div>
                    <img src=${flags[flag]}>
                </div>
            </high-option>`
        )}
    </high-select>
   `
}

define('language-select', LanguageSelect);


