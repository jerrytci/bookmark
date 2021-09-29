import Vue from 'vue'
import Router from 'vue-router'
import ElementUI from 'element-ui'
import Index from '@/page/Index'
import View from '@/page/View'
import Home from '@/page/Home'
import Extension from '@/page/Extension'
import Options from '@/page/Options'
import History from '@/page/History'
import About from '@/page/About'

Vue.use(Router);
Vue.use(ElementUI);

const router = new Router({
  routes: [
    {path: '/view', component: View, children: [
      {
        path: 'home',
        component: Home,
        name: 'home',
      },
      {
        path: 'index',
        component: Index,
        name: 'index',
      },
      {
        path: 'extension',
        component: Extension,
        name: 'extension',
      },
      {
        path: 'options',
        component: Options,
        name: 'options',
      },
      {
        path: 'about',
        component: About,
        name: 'about',
      },
      {
        path: '*',
        redirect: { name: 'home' }
      },]
    },
    {
      path: '/history',
      component: History,
      name: 'history',
    },
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
