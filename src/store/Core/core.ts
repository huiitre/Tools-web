/* import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations'; */

// import { State } from './Types';

const state = {
  user: {
    isLogged: true,
    iduser: null,
    type: null,
    token: null,
    email: null,
    password: null,
    nickname: null
  }
};
export default {
  namespaced: true,
  state,
  // mutations,
  // actions,
  // getters,
};
