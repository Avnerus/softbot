import { createStore } from 'redux';

import SocketController from '../common/socket-controller'

export const PHASE = {
    SIGN_IN: 1,
    HUD: 2
}

const reducer = (state = {
    phase: PHASE.SIGN_IN,
    socketController: null
}, action) => {
  console.log("Reducer?", action);
  switch (action.type) {
    case 'CHANGE_PHASE':
      return { ...state, phase: action.value};
    case 'SET_SOCKET_CONTROLLER': {
        return {...state, socketController: action.socketController}
    }
    default:
      return state;
  };
}

// Store instance as default export
export default createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), // redux dev tools
);

// Action creators as name exports
export const changePhase = (value = 1) => ({
  type: 'CHANGE_PHASE',
  value,
});

export const setSocketController = (socketController) => ({
    type: 'SET_SOCKET_CONTROLLER',
    socketController
})

export const connect = (store, mapState) => ({
  get: mapState ? () => mapState(store.getState()) : () => store.getState(),
  connect: (host, key, invalidate) => store.subscribe(invalidate),
});
