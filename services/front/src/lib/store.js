import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import user from './components/user/store'

export default new Vuex.Store({
  modules: {
    user
  }
})
