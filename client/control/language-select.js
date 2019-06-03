import { define, html } from 'hybrids';

import ReactFlagsSelect from 'react-flags-select';
//import css module
//import 'react-flags-select/css/react-flags-select.css';

import React from 'react';
import ReactDOM from 'react-dom';

function reactify(fn) {
  return (host) => {
    const Component = fn(host);
    return (host, target) => ReactDOM.render(Component, target);
  }
}

const LangaugeSelect =  {
    render: reactify(({}) => 
        <h1>hello</h1>
    )
}

define('language-select', LangaugeSelect);


