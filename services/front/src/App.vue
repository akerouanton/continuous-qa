<template>
  <div id="app">
    <header>
      <nav>
        <div>
          <ul>
            <li v-if="!isConnected"><a href="/connect/github">Connect with Github</a></li>
            <li v-if="isConnected"><router-link to="/">Disconnect</router-link></li>
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

export default {
  name: 'app',
  computed: {
    ...mapGetters({
      'isConnected': 'user.isConnected'
    })
  },
  async created () {
    const {status, body: profile} = await User.profile()
    if (status !== 200) {
      return
    }

    const {name, repositories} = profile
    this.$store.commit('user.profile', {name, repositories})
  }
}
</script>

<style lang="less">
@import '../node_modules/bootstrap/less/bootstrap.less';

nav {
  .navbar;
  .navbar-default;

  div {
    .container;
  }
  ul {
    .nav;
    .navbar-nav;
  }
}
</style>
