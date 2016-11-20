<template>
  <div class="dashboard">
    <ul>
      <li v-for="item in repositories">
        <router-link
          v-if="item.enabled"
          v-bind:to="{name: 'repository', params: {repoUrn: item.urn}}"
        >{{ item.name }}</router-link>
        <p v-if="!item.enabled">{{ item.name }}</p>

        <button v-if="!item.enabled" v-on:click="enableRepo(item)">Activer</button>
        <button v-if="item.enabled" v-on:click="disableRepo(item)">Désactiver</button>
      </li>
    </ul>
  </div>
</template>

<script>
import _ from 'underscore'
import {User, Repository} from '../lib/resources'

export default {
  name: 'dashboard',
  data () {
    return {repositories: []}
  },
  async created () {
    const [enabledRepos, userRepos] = await Promise.all([
      this.fetchRepositories(),
      this.fetchUserRepositories()
    ])

    const filteredRepos = userRepos.filter(
      userRepo => _.find(enabledRepos, enabledRepo => userRepo.name === enabledRepo.name) === undefined
    )

    this.repositories = [].concat(
      _.map(enabledRepos, ({urn, name, enabled}) => { return { urn, name, enabled } }),
      _.map(filteredRepos, ({name}) => { return { name, enabled: false } })
    )
  },
  methods: {
    async fetchRepositories () {
      const {status, body: list} = await Repository.list()

      return status !== 200 ? [] : list
    },
    async fetchUserRepositories () {
      const {status, body: profile} = await User.profile()

      return status !== 200 ? [] : profile.repositories
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

      repo = body
      console.log(repo)
    }
  }
}
</script>

<style scoped>
</style>
