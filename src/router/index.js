import Vue from 'vue'
import Router from 'vue-router'
import ElementUI from 'element-ui'
import Index from '@/page/Index'
import Options from '@/page/Options'

Vue.use(Router);
Vue.use(ElementUI);

const router = new Router({
  routes: [
    {path: '/app', component: Index, name: 'index'},
    {path: '/options', component: Options, name: 'options'},
  ]
});

if (PRODUCTION) import(
  /* webpackChunkName: "tracker", webpackMode: "lazy" */
  '@/common/util/tracker'
  ).then(({tracker}) => {
  tracker();
  router.beforeEach((to, from, next) => {
    ga('set', 'page', to.name);
    ga('send', 'pageview');
    next()
  })
});

export default router
