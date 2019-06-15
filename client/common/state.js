import {createStore} from 'redux';

import SocketController from '../common/socket-controller'

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
    phase: PHASE.SIGN_IN,
    socketController: null,
    transcript: [],
    picState: {
        [ROLES.CONTROLLER] : 0,
        [ROLES.AVATAR]: 0,
        key: ""
    },
    transcribeTarget: "en"
}, action) => {
  switch (action.type) {
    case 'CHANGE_PHASE':
      return { ...state, phase: action.value};
    case 'SET_TRANSCRIBE_TARGET':
      return { ...state, transcribeTarget: action.value};
    case 'SET_SOCKET_CONTROLLER': {
        if (action.manage) {
            action.socketController.sendValueCommand("R",0);
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
        }
        action.socketController.on('pic-state', (data) => {
            console.log("New pic state!", data.state);
            store.dispatch(setPicState(data.state));
        });
        return {...state, socketController: action.socketController}
    }
    case 'ADD_TRANSCRIPT' : {
        console.log("Add transcript line!", action.line);
        return {...state, transcript: [...state.transcript, action.line]}
    }
    case 'SET_PIC_STATE' : {
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

export const setTranscribeTarget = (value) => ({
    type: 'SET_TRANSCRIBE_TARGET',
    value,
})

export const connect = (store, mapState) => ({
  get: mapState ? () => mapState(store.getState()) : () => store.getState(),
  connect: (host, key, invalidate) => store.subscribe(invalidate),
});
