import { define, html, render } from 'hybrids'
import HighSelect from 'high-select/lib/high-select.js'

const language = "us";



const LanguageSelect =  {
    flags : {},
    languages: {
        connect: (host, key, invalidate) => {
            console.log("Connect languages?", host, key, host[key]);
        },
        set: async (host, value, lastValue) => {
          console.log("Set languages?", value);
          const flags = {};
          value.forEach(async (lang) => {
              flags[lang] = (await import(`svg-country-flags/svg/${lang}.svg`)).default
          })
          console.log("Done", flags['us']);
          host.flags = flags;
          return value;
        }
    },
    render: ({languages, flags}) => {
        console.log("Render?");
    return html`
    <style>
       img.flag-select { 
           width: 50px;
           height: 50px;
       }
    </style>
    <high-select>
        <high-option> 
            <img src=${flags['us']}>
        </high-option>
    </high-select>
   `
}}

define('language-select', LanguageSelect);


