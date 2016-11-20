<template>
  <div id="repository">
    {{ name }}
  </div>
</template>

<script>
import {Build, Repository} from '../lib/resources'

async function fetchRepository (repoUrn) {
  const {status, body: repo} = await Repository.get({repoUrn})
  return status !== 200 ? {} : repo
}

export default {
  name: 'repository',
  data () {
    return {
      name: null
    }
  },
  async beforeRouteEnter (to, from, next) {
    const {name} = await fetchRepository(to.params.repoUrn)
    this.name = name
    next()
  },
  methods: {
    fetchRepository,
    async fetchBuilds (repoUrn) {
      const {status, body: list} = await Build.list({repoUrn})
      return status !== 200 ? {} : list
    }
  },
  watch: {
    async $route (to, from) {
      this.name = null

      const {name} = await this.fetchRepository(to.params.repoUrn)
      this.name = name
    }
  }
}
</script>
