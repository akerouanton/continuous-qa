import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import App from './App'
import Signin from './components/Signin'

Vue.use(Vuex)
Vue.use(VueRouter)

const routes = [
  { path: '/signin', component: Signin }
]

const router = new VueRouter({routes})

/* eslint-disable no-new */
new Vue({
  router: router,
  el: '#app',
  template: '<App/>',
  components: { App }
})
