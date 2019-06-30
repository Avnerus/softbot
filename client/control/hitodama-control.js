import { html, render } from 'hybrids';
import store, {connect, CHAMBERS, addTranscript} from '../common/state'

import LookLeft from './images/look-left.png'
import LookRight from './images/look-right.png'
import LookStraight from './images/look-straight.png'

import EmojiAngry from './images/emoji-angry.png'
import EmojiAstonished from './images/emoji-astonished.png'
import EmojiHappy from './images/emoji-happy.png'

import * as Hitodama from '../common/hitodama'

const look = (host, event) => {
    event.preventDefault();
    const direction = $(event.target).attr("data-direction");
    console.log("Look " + direction);
    if (direction == "left") {
        Hitodama.deflate(
            host.socketController,
            CHAMBERS.RIGHT_NECK,
            500
        )
        .then(() => {
            Hitodama.inflateTo(
                host.socketController,
                CHAMBERS.LEFT_NECK,
                1.0
            )
        })
    } else if (direction == "right") {
        Hitodama.deflate(
            host.socketController,
            CHAMBERS.LEFT_NECK,
            500
        )
        .then(() => {
            Hitodama.inflateTo(
                host.socketController,
                CHAMBERS.RIGHT_NECK,
                1.0
            )
        })
    } else if (direction == "center") {
        Hitodama.deflate(
            host.socketController,
            CHAMBERS.LEFT_NECK
        )
        Hitodama.deflate(
            host.socketController,
            CHAMBERS.RIGHT_NECK
        )
    }
    store.dispatch(addTranscript({
        from: "You",
        text: "look at the person to the " + direction,
        class: "gaze"
    }));
}
const express = (host, event) => {
    event.preventDefault();
    const emotion = $(event.target).attr("data-emotion");
    console.log("Express " + emotion);
    if (emotion == "angry") {
        Hitodama.inflateTo(
            host.socketController,
            CHAMBERS.EYES,
            0.9,
            2000
        )
        .then(() => {
            Hitodama.deflate(
                host.socketController,
                CHAMBERS.EYES
            )
        });
        store.dispatch(addTranscript({
            from: "You",
            text: "😠",
            class: "expression"
        }));


    }
    else if (emotion == "happy") {
        Hitodama.inflateTo(
            host.socketController,
            CHAMBERS.CHEEKS,
            1.0,
            2500
        )
        .then(() => {
            Hitodama.deflate(
                host.socketController,
                CHAMBERS.CHEEKS
            )
        });
        store.dispatch(addTranscript({
            from: "You",
            text: "☺️:",
            class: "expression"
        }));
    } 
    else if (emotion == "astonished") {
        /*
        Hitodama.inflateTo(
            host.socketController,
            CHAMBERS.CHEEKS,
            0.75,
            2000
        )
        .then(() => {
            Hitodama.deflate(
                host.socketController,
                CHAMBERS.CHEEKS
            )
        });*/
        Hitodama.inflateTo(
            host.socketController,
            CHAMBERS.MOUTH,
            1.0,
            2000
        )
        .then(() => {
            Hitodama.deflate(
                host.socketController,
                CHAMBERS.MOUTH
            )
        });
        store.dispatch(addTranscript({
            from: "You",
            text: "😲",
            class: "expression"
        }));
    } 
}

export default {
    socketController: connect(store, (state) => state.socketController),
    render: ({socketController}) => { 
       return html`
        <style>
            :host {
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;

            }
            #control-container {
                background-color: #fbf5fb;
                height: 100%;
                width: 100%;:
            }
            .control-button {
                width: var(--icon-size, 70px);
                height: var(--icon-size, 65px);
                padding: 5px;
                background-color: #dfdbfb;
                border-style: solid;
                border-width: 1px;
                border-radius: 5px;
                box-shadow: 2px 2px gray;
                display:flex;
                font-size: 70px;
            }
            .button-row {
                display: flex;
                flex-direction: row;
                justify-content: space-evenly;
                margin-top: 10px;
            }
        </style>
        <div id="control-container">
            <div class="button-row">
                <a onclick="${look}" href="">
                    <img data-direction="left" class="control-button" src=${LookLeft}>
                </a>
                <a onclick="${look}" href="">
                    <img data-direction="center" class="control-button" src=${LookStraight}>
                </a>
                <a onclick="${look}" href="">
                    <img data-direction="right"class="control-button" src=${LookRight}>
                </a>
            </div>
            <div class="button-row">
                <a onclick="${express}" href="">
                    <img data-emotion="happy" class="control-button" src=${EmojiHappy}>
                </a>
                <a onclick="${express}" href="">
                    <img data-emotion="astonished" class="control-button" src=${EmojiAstonished}>
                </a>
                <a onclick="${express}" href="">
                    <img data-emotion="angry" class="control-button" src=${EmojiAngry}>
                </a>
            </div>
        </div>
     `
   }
}
