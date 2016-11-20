const state = {
  connected: false,
  token: null,
  name: null,
  repositories: []
}

const getters = {
  'user.isConnected': (state) => state.connected,
  'user.repositories': (state) => state.repositories
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
  },
  'user.profile': (state, {name, repositories}) => {
    if (!state.connected) {
      throw new Error('User is not connected.')
    }

    state.name = name
    state.repositories = repositories
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
