import Vue from 'vue'
import App from './App'
import store from './lib/store'
import router from './lib/router'
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import resources from './lib/resources'

/* eslint-disable no-new */
new Vue({
  router,
  store,
  el: '#app',
  template: '<App/>',
  components: { App }
})
