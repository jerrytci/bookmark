<template>
  <div>
    <waterfall :grow="grow" :watch="lists" ref="waterfall" line-gap="">
      <waterfall-slot v-for="(list, index) in lists" :key="list.id"
                      :width="200" :height="200"
                      :order="index">
        <el-card class="box-card" :body-style="{padding: '0px'}" :style="{margin: _px(meta.margin)}">
          <div class="label" style="width: inherit">
            <div class="label-title">
              <a>{{list.title == '' ? '未设置名字, 未设置名字未设置名字未设置名字还要更长还要更长还要更长' : list.title}}</a>
            </div>
            <!--恢复-->
            <i class="el-icon-view"></i>
            <!--更改自身名字-->
            <i class="el-icon-edit-outline"></i>
            <!--删除自身-->
            <i class="el-icon-remove-outline"></i>
            <!--保存为topic-->
            <!--todo icon:save-->
            <i class="el-icon-star-off"></i>
          </div>
          <div class="link" style="width: inherit" v-for="(tab) in list.tabs">
            <div>
              <img :src="tab.favIconUrl == null ? '/assets/icons/icon_16.png' : tab.favIconUrl">
              <a :href="tab.url" target="_blank">{{tab.title}}</a>
            </div>
            <i class="el-icon-remove-outline"></i>
          </div>
        </el-card>
      </waterfall-slot>
    </waterfall>
  </div>
</template>

<script>
  import $ from 'jquery'
  import Waterfall from 'vue-waterfall/lib/waterfall'
  import WaterfallSlot from 'vue-waterfall/lib/waterfall-slot'
  import storage from "@/common/storage";

  export default {
    name: "Home",
    components: {
      Waterfall,
      WaterfallSlot,
    },
    data() {
      return {
        grow: [1, 1, 1, 1, 1],
        lists: [],
        meta: {
          margin: 10,
        },
      }
    },
    created() {
      let _this = this;
      // 获取unclassified links
      storage.getLists().then(lists => {
        if (lists) {
          this.lists = lists.filter(i => Array.isArray(i.tabs))
        }
      });

      // list增删事件监听
      chrome.storage.onChanged.addListener(changes => {
        if (changes.lists) {
          const newLists = changes.lists.newValue;
          this.lists = newLists.filter(i => Array.isArray(i.tabs))
        }
      })
    },
    computed: {},
    watch: {},
    methods: {
      _px(param) {
        return param + 'px';
      },
      styleRoot() {
      },
    }
  }
</script>

<style lang="stylus" scoped>
  .label
    display flex
    font-weight bold
    font-size 14px
    & > i
      padding 10px
      &:hover
        background-color rgb(235, 235, 235)
    & > div > a
      padding 8px 10px;
      &:hover
        background-color rgb(235, 235, 235)

  .links-column-root
    display flex

  .link
    font-size 12px
    display flex
    & > i
      padding 6px
      &:hover
        background-color rgb(235, 235, 235)
    & > div
      display flex
      padding 4px 10px;
      &:hover
        background-color: rgb(235, 235, 235);
      & > img
        width: 16px
        height: 16px
        margin-right: 4px
        vertical-align unset

  .label > div > a,
  .link > div > a
    vertical-align: top;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;

    cursor: default;
    &:link
      text-decoration: none
      cursor: default
      color: black
    &:visited
      text-decoration: none;
      cursor: default;
      color: black;
    &:active
      text-decoration: none;
      cursor: default;
    &:hover
      text-decoration: none;
      cursor: default;
</style>
