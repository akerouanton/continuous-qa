import Vue from 'vue'

const resource = Vue.resource('/', {}, {
  list: {method: 'GET', url: '/repositories'},
  add: {method: 'POST', url: '/repositories'},
  remove: {method: 'DELETE', url: '/repository{/repoUrn}'},
  get: {method: 'GET', url: '/repository{/repoUrn}'}
})

export default resource
