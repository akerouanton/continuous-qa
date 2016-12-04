/* global localStorage */
const state = {
  connected: localStorage.getItem('token') !== null,
  connecting: localStorage.getItem('connecting'),
  token: localStorage.getItem('token'),
  name: null,
  repositories: []
}

const getters = {
  'user.isConnected': (state) => state.connected,
  'user.isConnecting': (state) => state.connecting,
  'user/repositories': (state) => state.repositories
}

const actions = {}

const mutations = {
  'user.connect': (state, { token }) => {
    if (!token) {
      throw new Error('No token provided')
    } else if (state.connected) {
      throw new Error('User already connected.')
    }

    state.connected = true
    state.token = token

    localStorage.setItem('token', token)
  },
  'user.profile': (state, {name, repositories}) => {
    if (!state.connected) {
      throw new Error('User is not connected.')
    }

    state.name = name
    state.repositories = repositories
  },
  'user.connecting': (state) => {
    state.connecting = true
    localStorage.setItem('connecting', true)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
