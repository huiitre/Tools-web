import { createStore } from "vuex";
import Core from './Core/core'
// import StringGenerator from './modules/StringGenerator/StringGenerator'
// import StringList from './modules/StringList/StringList'

const store = createStore({
  modules: {
    Core,
    /* StringGenerator,
    StringList */
  }
})

export default store