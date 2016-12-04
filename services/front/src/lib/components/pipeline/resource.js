import Vue from 'vue'

const resource = Vue.resource('/', {}, {
  list: {method: 'GET', url: '/pipelines{/repoUrn}'}
})

export default resource
