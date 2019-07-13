import {createStore} from 'redux';

import SocketController from '../common/socket-controller'
import * as Hitodama from '../common/hitodama'

export const CHAMBERS = {
    LEFT_NECK: 0,
    RIGHT_NECK: 1,
    DOWN_NECK: 2,
    EYES: 3,
    CHEEKS: 4,
    ARMS: 5,
    MOUTH: 6
}

export const PHASE = {
    SIGN_IN: 1,
    HUD_NOPICS: 2,
    HUD_PICS: 3,
    HUD_PICS_VIDEO: 4
}

export const PIC_STATE = {
    WAITING: 0,
    READY: 1,
    CHOSE_1: 2,
    CHOSE_2: 3,
    EXPLAIN_1: 4,
    EXPLAIN_2: 5,
    DONE_1: 6,
    DONE_2: 7 
}

export const ROLES = {
    CONTROLLER: "CONTROL",
    AVATAR: "AVATAR"
}

export const OTHER = {
    "CONTROL": "AVATAR",
    "AVATAR": "CONTROL"
}

const reducer = (state = {
    identity: null,
    phase: PHASE.SIGN_IN,
    socketController: null,
    listener: null,
    transcript: [],
    picState: {
        [ROLES.CONTROLLER] : 0,
        [ROLES.AVATAR]: 0,
        key: ""
    },
    softbotState: {
        [ROLES.CONTROLLER] : 0,
        [ROLES.AVATAR]: 0,
        softControllerName: ""
    },
    transcribeTarget: "en",
    transcribeSource: "en-US",
    transcriptionResult: null,
    controllerTitle: "",
    cameraStream: null,
    arms: {
        0: 0,
        1: 0
    }
}, action) => {
  switch (action.type) {
    case 'CHANGE_PHASE':
      return { ...state, phase: action.value};
    case 'SET_TRANSCRIBE_TARGET':
      return { ...state, transcribeTarget: action.value};
    case 'SET_SOCKET_CONTROLLER': {
        if (action.manage) {
            action.socketController.subscribeToPrefix('E', (msg) => {
                store.dispatch(addTranscript({
                    from: "Error",
                    text: msg.slice(1)
                }));
            });
            action.socketController.subscribeToPrefix('I', (msg) => {
                store.dispatch(addTranscript({
                    from: "System",
                    text: msg.slice(1)
                }));
            });
            action.socketController.subscribeToPrefix('S', (data) => {
                let text = new TextDecoder("utf-8").decode(new Uint8Array(data,2))
                const armId = parseInt(text[1]);
                if (text[0] == 'P') {
                    store.dispatch(setArmState(armId,1));
                } else if (text[0] == 'R') {
                    store.dispatch(setArmState(armId,0));
                }
            })

            action.socketController.on('start-recognizing',(data) => {
                store.dispatch(startRecognizing(data.source));
            });
            action.socketController.on('stop-recognizing',() => {
                store.dispatch(stopRecognizing());
            });
            if (state.phase > PHASE.SIGN_IN) {
                action.socketController.send("R" + String.fromCharCode(0) + state.controllerTitle);
            }
        }
        action.socketController.on('pic-state', (data) => {
            console.log("New pic state!", data.state);
            store.dispatch(setPicState(data.state));
        });
        action.socketController.on('softbot-state', (data) => {
            console.log("New softbot state!", data.state);
            store.dispatch(setSoftbotState(data.state));
        });
        action.socketController.on('transcription-result', (data) => {
            console.log("Transcription result!", data);
            store.dispatch(setTranscriptionResult(data));
            setTimeout(() => {
                store.dispatch(setTranscriptionResult(null));
            },2000)
        });
        return {...state, socketController: action.socketController}
    }
    case 'ADD_TRANSCRIPT' : {
        console.log("Add transcript line!", action.line);
        return {...state, transcript: [...state.transcript, action.line]}
    }
    case 'SET_PIC_STATE' : {
        if (state.identity == ROLES.CONTROLLER && action.value[ROLES.CONTROLLER] == PIC_STATE.WAITING) {
            console.log("Close arms!");
            Hitodama.inflateTo(
                state.socketController,
                CHAMBERS.ARMS,
                0.8
            )
        }

        if (state.phase != PHASE.SIGN_IN) {
            let phase;
            if (action.value[ROLES.AVATAR] == PIC_STATE.WAITING ||
                action.value[ROLES.CONTROLLER] == PIC_STATE.WAITING) {
                phase = PHASE.HUD_NOPICS;            
            } else if (action.value[ROLES.CONTROLLER] == PIC_STATE.READY) {
                phase = PHASE.HUD_PICS;
            } else {
                phase = PHASE.HUD_PICS_VIDEO;
            }
            console.log("Phase is now " + phase, action.value)


            return {...state, phase: phase, picState : action.value}
        } else {
            return {...state, picState : action.value}
        }
    }
    case 'SET_SOFTBOT_STATE' : {
        return {...state, softbotState : action.value}
    }
    case 'SET_TRANSCRIBE_SOURCE' : {
        return {...state, transcribeSource : action.value}
    }
    case 'SET_CAMERA_STREAM' : {
        console.log("Set camera stream", action.value);
        return {...state, cameraStream : action.value}
    }
    case 'SET_LISTENER' : {
        console.log("Set listener", action.value);
        return {...state, listener : action.value}
    }
    case 'START_RECOGNIZING' : {
        console.log("Start recognizing?", state.listener, state.cameraStream);
        if (state.listener && state.cameraStream) {
            state.listener.startRecognizing({
                stream: state.cameraStream,
                model: action.source,
                translate: state.transcribeTarget
            });
        }
        return state;
    }
    case 'STOP_RECOGNIZING' : {
        console.log("Stop recognizing?", state.listener);
        if (state.listener) {
            state.listener.stopRecognizing();
        }
        return state;
    }
    case 'SET_TRANSCRIPTION_RESULT' : {
        return {...state, transcriptionResult : action.value}
    }
    case 'SET_IDENTITY' : {
        return {...state, identity : action.value}
    }
    case 'SET_CONTROLLER_TITLE' : {
        return {...state, controllerTitle : action.value}
    }
    case 'SET_ARM_STATE' : {
        console.log("New arm state!", action.id, action.value);
        return {...state, arms : {...state.arms, [action.id] : action.value}}
    }
    default:
      return state;
  };
}

// Store instance as default export
const store = createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), // redux dev tools
);

export default store;

// Action creators as name exports
export const changePhase = (value = 1) => ({
  type: 'CHANGE_PHASE',
  value,
});

export const addTranscript = (line) => ({
  type: 'ADD_TRANSCRIPT',
  line,
});

export const setSocketController = (socketController, manage) => ({
    type: 'SET_SOCKET_CONTROLLER',
    socketController,
    manage
})

export const setPicState = (value) => ({
    type: 'SET_PIC_STATE',
    value,
})

export const setSoftbotState = (value) => ({
    type: 'SET_SOFTBOT_STATE',
    value,
})

export const setTranscribSource = (value) => ({
    type: 'SET_TRANSCRIBE_SOURCE',
    value,
})

export const setTranscribeTarget = (value) => ({
    type: 'SET_TRANSCRIBE_TARGET',
    value,
})

export const setCameraStream = (value) => ({
    type: 'SET_CAMERA_STREAM',
    value,
})

export const startRecognizing = (source) => ({
    type: 'START_RECOGNIZING',
    source
})

export const stopRecognizing = () => ({
    type: 'STOP_RECOGNIZING'
})

export const setListener = (value) => ({
    type: 'SET_LISTENER',
    value
})

export const setTranscriptionResult = (value) => ({
    type: 'SET_TRANSCRIPTION_RESULT',
    value
})

export const setIdentity = (value) => ({
    type: 'SET_IDENTITY',
    value
})

export const setControllerTitle = (value) => ({
    type: 'SET_CONTROLLER_TITLE',
    value
})

export const setArmState = (id, value) => ({
    type: 'SET_ARM_STATE',
    id,
    value
})

export const connect = (store, mapState) => ({
  get: mapState ? () => mapState(store.getState()) : () => store.getState(),
  connect: (host, key, invalidate) => store.subscribe(invalidate)
});
