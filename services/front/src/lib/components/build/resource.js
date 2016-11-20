import Vue from 'vue'

const resource = Vue.resource('/', {}, {
  list: {method: 'GET', url: '/builds{/repoUrn}'}
})

export default resource
