import { html, children } from 'hybrids';

export default {
    render: ({state}) => html`
        <h1>Hello world!</h1>
        <slot name="content">
        </slot>
     `
}
