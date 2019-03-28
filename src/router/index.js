import Vue from 'vue'
import Router from 'vue-router'
import ElementUI from 'element-ui'
import HOME from '@/page/HOME'
import Index from '@/page/Index'
import Account from '@/page/Account'

Vue.use(Router);
Vue.use(ElementUI);

const router = new Router({
  routes: [
    /*{
      path: '/app',
      component: HOME,
      name: 'index',
    },*/
    {
      path: '/app',
      component: Index,
      name: 'index',
    },
    /*{
      path: '/account',
      component: Account,
      name: 'account',
    },*/

  ]
})

if (PRODUCTION) import(
  /* webpackChunkName: "tracker", webpackMode: "lazy" */
  '@/common/util/tracker'
).then(({tracker}) => {
  tracker()
  router.beforeEach((to, from, next) => {
    ga('set', 'page', to.name)
    ga('send', 'pageview')
    next()
  })
})

export default router
