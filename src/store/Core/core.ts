
import * as actions from './actions';
import * as mutations from './mutations';
import * as getters from './getters';

// import { State } from './Types';

import { baseUser } from '@/utils/Core/createUserInfos';

const state = {
  user: { ...baseUser },
  isLoading: false,
  modules: [],
  platform: 'desktop'
};
export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
