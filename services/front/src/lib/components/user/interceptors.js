import Vue from 'vue'

import store from '../../store'

Vue.http.interceptors.push((request, next) => {
  if (!store.state.user.connected) {
    return next()
  }

  request.headers.map['Authorization'] = [`Bearer ${store.state.user.token}`]
  next()
})
