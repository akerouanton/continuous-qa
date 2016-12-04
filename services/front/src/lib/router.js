import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import Dashboard from '../components/Dashboard'
import Repository from '../components/Repository.vue'
import App from '../App.vue'

const router = new VueRouter({routes: [
  { path: '/logout', component: App },
  { path: '/dashboard', component: Dashboard },
  { path: '/repository/:repoUrn', name: 'repository', component: Repository }
]})

export default router
