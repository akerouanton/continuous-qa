<template>
  <div id="app">
    <header>
      <nav class="navbar navbar-default">
        <div class="container">
          <ul v-if="!isConnected">
            <li><a href="/connect/github">Connect with Github</a></li>
          </ul>
          <ul v-if="isConnected" class="navbar-nav nav">
            <li><router-link to="/dashboard">Dashboard</router-link></li>
            <li><router-link to="/logout">Disconnect</router-link></li>
          </ul>
        </div>
      </nav>
    </header>

    <div id="body">
      <main>
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'
import {User} from './lib/resources'
import {default as store} from './lib/store'

export default {
  name: 'app',
  computed: {
    ...mapGetters({
      'isConnected': 'user.isConnected'
    })
  },
  async created () {
    if (!store.state.user.connected && !store.state.user.connecting) {
      return
    }

    const {headers, body: {name, repositories}} = await User.profile()
    if (!store.state.user.connected) {
      this.$store.commit('user.connect', {token: headers.map['X-Auth-Token'][0]})
    }

    this.$store.commit('user.profile', {name, repositories})
  }
}
</script>

<style lang="less">
@import '../node_modules/bootstrap/less/bootstrap.less';
</style>
