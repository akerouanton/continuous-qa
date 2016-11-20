import Vue from 'vue'
import VueResource from 'vue-resource'

Vue.use(VueResource)

const resource = Vue.resource('/', {}, {
  profile: {method: 'GET', url: '/profile'}
})

export default resource
