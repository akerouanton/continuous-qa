<template>
  <div id="repository">
    <h2>{{ name }}</h2>

    <p>Pipelines :</p>
    <ul v-for="pipeline in pipelines">
      <li>{{ pipeline.pattern }}</li>
    </ul>

    <hr/>

    <p>Builds :</p>
    <ul v-for="build in builds">
      <li>{{ build.urn }}</li>
    </ul>
  </div>
</template>

<script>
import {Build, Repository, Pipeline} from '../lib/resources'

async function fetchRepository (repoUrn) {
  const {status, body: repo} = await Repository.get({repoUrn})
  return status !== 200 ? {} : repo
}

async function fetchPipelines (repoUrn) {
  const {status, body: pipelines} = await Pipeline.list({repoUrn})
  return status !== 200 ? {} : pipelines
}

async function fetchBuilds (repoUrn) {
  const {status, body: builds} = await Build.list({repoUrn})
  return status !== 200 ? {} : builds
}

export default {
  name: 'repository',
  data () {
    return {
      urn: null,
      name: null,
      pipelines: [],
      builds: []
    }
  },
  async beforeRouteEnter (to, from, next) {
    const [{name}, pipelines, builds] = await Promise.all([
      fetchRepository(to.params.repoUrn),
      fetchPipelines(to.params.repoUrn),
      fetchBuilds(to.params.repoUrn)
    ])

    next((vm) => {
      vm.urn = to.params.repoUrn
      vm.name = name
      vm.pipelines = pipelines
      vm.builds = builds
    })
  },
  methods: {},
  watch: {
    async $route (to, from) {
      const [{name}, pipelines, builds] = await Promise.all([
        fetchRepository(to.params.repoUrn),
        fetchPipelines(to.params.repoUrn),
        fetchBuilds(to.params.repoUrn)
      ])

      this.urn = to.params.repoUrn
      this.name = name
      this.pipelines = pipelines
      this.builds = builds
    }
  }
}
</script>
