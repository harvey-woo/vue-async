import Vue from 'vue'
import VueAsync from '../src'
import VueRouter from 'vue-router'
import getRoutes from './routes'

export default function main(context) {
  Vue.use(VueRouter)
  Vue.use(VueAsync, {
    context
  })
  const router = new VueRouter({
    mode: 'history',
    routes: getRoutes()
  })
  context.router = router
  const app = new Vue({
    router,
    render(h) {
      return h('router-view')
    }
  })
  return app
}