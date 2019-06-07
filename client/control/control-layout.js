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

                background-color: #fdffff;

				font-family: Roboto;
            }
			::slotted(div) {
				width: 90vw;
				height: 95vh;
				background-color: #f7dbff;
				border-radius: 40px;
			}
        </style>
		<slot name="content">
		</slot>
     `
}
