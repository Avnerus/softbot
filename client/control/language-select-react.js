import Element, { h, setProps } from '@skatejs/element-react';

import React from 'react';
import ReactDOM from 'react-dom';

import Select from 'react-select';

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
];

class LanguageSelect extends Element {
    attachShadow() {
      return this;
    }
    render() {
        return (
            <Select
                options={options}
            />
        )
    }
}

customElements.define('language-select', LanguageSelect);


