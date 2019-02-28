<template>
  <div class="navigation-bar">
    <div>
      <router-link to="/app">
        <img src="/assets/icons/topic-logo.png" alt="topic logo">
      </router-link>
    </div>
    <div>
      <el-input style="padding: 6px 0" size="mini" v-model="input" placeholder="搜索"></el-input>
    </div>
    <div>
      <ul>
        <li>
          <router-link to="/about">关于</router-link>
        </li>
        <li>
          <router-link to="/options">设置</router-link>
        </li>
        <li>
          <router-link to="/account">账户</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    name: "NavigationBar",
    data(){
      return {
        input: ''
      }
    }
  }
</script>

<style lang="stylus" scoped>
  .navigation-bar
    display grid
    grid-template-columns: 120px auto 256px
    grid-template-areas "1 2 3"
    .box-header
      grid-area 1
    .box-sidebar
      grid-area 2
    .box-content
      grid-area 3

    padding 0 60px 0 60px
    height 40px
    position relative
    z-index 100
    background-color #fff
    /*横划线*/
    box-shadow 0 0 1px rgba(0, 0, 0, 0.25)
    transition background-color 0.3s ease-in-out

    &>div:nth-child(1)
      &>a
        display: inline-block;
        line-height: 40px;
        img
          vertical-align: middle;
          padding: 0 5px;
          width: 119px;
          height: 37px;
    &>div:nth-child(2)
      padding 0 20px 0 60px
    &>div:nth-child(3)>ul
      font-size 16px
      margin 0
      li
        max-height 37px
        margin 0 10px
        text-decoration none
        list-style none
        float right
        border 0 solid #ffffff
        a
          color #040404
          text-decoration none
          margin 0
          display block
          padding 8px 10px
          text-align center
          /*定义链接的悬停效果，让导航栏更美观*/
          &:hover
            border-bottom 3px solid #42b983
</style>
