import Vue from 'vue'
import VueResource from 'vue-resource'

Vue.use(VueResource)

/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import interceptors from './components/user/interceptors'
export {default as User} from './components/user/resource'
export {default as Repository} from './components/repository/resource'
export {default as Build} from './components/build/resource'
export {default as Pipeline} from './components/pipeline/resource'
