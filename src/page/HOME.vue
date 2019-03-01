<template>
  <div>
    <waterfall :grow="grow" :watch="lists" ref="waterfall" line-gap="" :fixed-height="true">
      <waterfall-slot v-for="(list, index) in lists" :key="list.id"
                      :width="1" :height="itemHeight(list.tabs.length)"
                      :order="index">
        <el-card class="box-card" :body-style="{padding: '0px'}" :style="{margin: _px(itemMeta.margin)}">
          <div class="label" style="width: inherit">
            <div class="label-title">
              <a>{{list.title == '' ? '未设置名字' : list.title}}</a>
            </div>
            <i class="el-icon-edit-outline"></i>
            <i class="el-icon-remove-outline"></i>
          </div>
          <div class="link" style="width: inherit" v-for="(tab) in list.tabs">
            <div class="link-title">
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
        itemMeta: {
          margin: 10,
          content: 24,
          header: 35.2
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
      itemHeight: function (linkCount) {
        return linkCount * this.itemMeta.content + this.itemMeta.header + this.itemMeta.margin * 2;
      },
    }
  }
</script>

<style lang="stylus" scoped>
  .label-title
    width calc(100% - 24px * 2)

  /*10:padding.*/
  .link-title
    width calc(100% - 24px - 10px * 2)

  .label
    display flex
    font-weight bold
    font-size 14px
    & > i
      padding 10px 5px
      &:hover
        background-color rgb(235, 235, 235)
    & > div
      display flex
      & > a
        padding 8px 10px;
        &:hover
          background-color rgb(235, 235, 235)

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
