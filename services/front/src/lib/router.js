import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import Dashboard from '../components/Dashboard'
import Repository from '../components/Repository.vue'

const router = new VueRouter({routes: [
  { path: '/dashboard', component: Dashboard },
  { path: '/repository/:repoUrn', name: 'repository', component: Repository }
  /* { path: '/signin', component: Signin },
   { path: '/connected', component: Connected } */
]})

export default router
