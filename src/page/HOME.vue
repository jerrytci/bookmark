<template>
  <div class="box">
    <div class="box-header">
      <navigation-bar></navigation-bar>
    </div>
    <div class="box-content">
      <span>hello, onetab2</span>
    </div>
  </div>
</template>

<script>
  import NavigationBar from '@/component/NavigationBar'

  export default {
    name: "Home",
    components: {
      NavigationBar,
    },
  }
</script>

<style lang="stylus" scoped>
  .box
    display grid
    grid-template-rows 40px auto
    grid-template-areas "header" "content"
    .box-header
      grid-area header
    .box-content
      grid-area content
</style>
