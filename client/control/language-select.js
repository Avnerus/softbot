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
       img.flag-select { 
           width: var(--size, 50px);
           height: var(--size, 50px);
       }
       high-select {
           width: var(--size, 50px);
           height: var(--size, 50px);
       }
    </style>
    <high-select>
        ${Object.keys(flags).map(flag => html`
            <high-option> 
                <img class="flag-select" src=${flags[flag]}>
            </high-option>`
        )}
    </high-select>
   `
}

define('language-select', LanguageSelect);


