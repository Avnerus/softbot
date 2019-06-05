import { html, render } from 'hybrids';

export default {
    render: ({state}) => html`

        <style>
            :host {
                width: 100vw;
                height: 100vh;
                position: absolute;
                padding: 0;
                margin: 0;
                top: 0;

                display: flex;
                align-items: center;
                justify-content: center;

                background-color: #3af8ffba;
            }
        </style>
        <slot name="content">
        </slot>
     `
}
