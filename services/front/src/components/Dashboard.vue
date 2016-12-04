<template>
  <div class="dashboard">
    <ul>
      <li v-for="item in repositories">
        <router-link v-bind:to="{name: 'repository', params: {repoUrn: item.urn}}">{{ item.name }}</router-link>

        <button v-if="!item.enabled" v-on:click="enableRepo(item)">Activer</button>
        <button v-if="item.enabled" v-on:click="disableRepo(item)">Désactiver</button>
      </li>
    </ul>
  </div>
</template>

<script>
import _ from 'underscore'
import {Repository} from '../lib/resources'

export default {
  name: 'dashboard',
  data () {
    return {enabledRepos: []}
  },
  async created () {
    this.enabledRepos = await this.fetchEnabledRepositories()
  },
  computed: {
    repositories () {
      const repos = this.$store.getters['user/repositories']

      return repos.map((repo) => {
        const enabled = _.find(this.enabledRepos, enabledRepo => repo.name === enabledRepo.name) !== undefined

        return {...repo, enabled}
      })
    }
  },
  methods: {
    async fetchEnabledRepositories () {
      const {status, body: list} = await Repository.list()

      return status !== 200 ? [] : list
    },
    async enableRepo ({name}) {
      const {status, body: repo} = await Repository.add({type: 'github', name})
      if (status !== 201 && status !== 200) {
        return
      }

      this.repositories.push({urn: repo.urn, name: repo.name, enabled: true})
    },
    async disableRepo (repo) {
      const {status, body} = await Repository.remove({repoUrn: repo.urn})
      if (status !== 204) {
        console.log(body)
        return
      }

      repo.enabled = false
    }
  }
}
</script>

<style scoped>
</style>
