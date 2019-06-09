import {createStore} from 'redux';

import SocketController from '../common/socket-controller'

export const PHASE = {
    SIGN_IN: 1,
    HUD: 2
}

export const PIC_STATE = {
    WAITING: 0,
    READY: 1,
    CHOSE_1: 2,
    CHOSE_2: 3,
    EXPLAINING: 4
}

const reducer = (state = {
    phase: PHASE.SIGN_IN,
    socketController: null,
    transcript: [],
}, action) => {
  switch (action.type) {
    case 'CHANGE_PHASE':
      return { ...state, phase: action.value};
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
        return {...state, socketController: action.socketController}
    }

    case 'ADD_TRANSCRIPT' : {
        console.log("Add transcript line!", action.line);
        return {...state, transcript: [...state.transcript, action.line]}
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

export const connect = (store, mapState) => ({
  get: mapState ? () => mapState(store.getState()) : () => store.getState(),
  connect: (host, key, invalidate) => store.subscribe(invalidate),
});
