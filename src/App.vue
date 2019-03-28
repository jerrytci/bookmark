<template>
<div id="app">
  <router-view></router-view>
</div>
</template>
<script>
import './assets/css/fontawesome-all.min.css'
import 'element-ui/lib/theme-chalk/index.css';

export default {
  name: 'app',
  created() {
    if (PRODUCTION) import(
      /* webpackChunkName: "tracker", webpackMode: "lazy" */
      '@/common/util/tracker'
    ).then(({tracker}) => {
      tracker()
      if (!this.$route.name) return
      ga('set', 'page', this.$route.name)
      ga('send', 'pageview')
    })
  },
}
</script>
<style lang="scss">
</style>

