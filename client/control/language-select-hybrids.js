import { define, html, render } from 'hybrids';

import React from 'react';
import ReactDOM from 'react-dom';

import Select from 'react-select';

function reactify(fn, style) {
  return (host) => {
    const Component = fn(host);
      return (host, target) => {
          ReactDOM.render(Component, target);
          /*
          if (style) {
            const reactStyle = document.createElement('style');
            reactStyle.innerHTML = style;
            target.appendChild(reactStyle)
          }*/
     }
  }
}

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
];

const LanguageSelect =  {
    render: render(reactify(({count}) => 
        <Select
            options={options}
          />
    ), {shadowRoot: false})

}

define('language-select', LanguageSelect);


