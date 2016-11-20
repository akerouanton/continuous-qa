import Vue from 'vue'

import store from '../../store'

Vue.http.interceptors.push((request, next) => {
  if (!store.state.user.connected) {
    return next((response) => {
      if (!store.state.user.connected && response.headers && response.headers.map['X-Auth-Token']) {
        store.commit('user.connect', {token: response.headers.map['X-Auth-Token'][0]})
      }
    })
  }

  request.headers.map['Authorization'] = [`Bearer ${store.state.user.token}`]
  console.log(request)
  next()
})
