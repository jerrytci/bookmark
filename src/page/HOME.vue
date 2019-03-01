<template>
  <div>
    <waterfall :grow="grow" :watch="lists" ref="waterfall" line-gap="" :fixed-height="true">
      <waterfall-slot :width="1" :height="72">
        <el-card class="box-card" :body-style="{padding: '0px'}" :style="{margin: _px(itemMeta.margin)}">
          <div class="bookmark">
            <div style="width: 100px">
              <img style="padding: 0 15px 0 30px" :src="'/assets/icons/icon_48.png'">
            </div>
            <el-select v-model="value" placeholder="请选择" clearable value="" style="padding: 5px;">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </div>
        </el-card>
      </waterfall-slot>
      <waterfall-slot :width="1" :height="itemHeight(list.tabs.length)"
                      v-for="(list, index) in lists" :key="list.id"
                      :order="index">
        <el-card class="box-card" :body-style="{padding: '0px'}" :style="{margin: _px(itemMeta.margin)}">
          <div class="label" style="width: inherit">
            <div class="label-title">
              <a @click="restoreList(index, true)">{{list.title === '' ? '未设置名字' : list.title}}</a>
            </div>
            <i class="el-icon-star-off" @click="tabSave(index)"></i>
            <i class="el-icon-edit-outline" @click="renameList(index, list.title)"></i>
            <i class="el-icon-remove-outline" @click="removeList(index)"></i>
          </div>
          <div class="link" style="width: inherit" v-for="(tab, tabIndex) in list.tabs">
            <div class="link-title">
              <img :src="tab.favIconUrl == null ? '/assets/icons/icon_16.png' : tab.favIconUrl">
              <a :href="tab.url" target="_blank">{{tab.title}}</a>
            </div>
            <i class="el-icon-remove-outline" @click="tabRemove(index, tabIndex)"></i>
          </div>
        </el-card>
      </waterfall-slot>
    </waterfall>
  </div>
</template>

<script>
  const host = 'http://localhost:8080';
  const urlTopicAdd = host + "/basic/add";
  import $ from 'jquery'

  import _ from 'lodash'
  import Waterfall from 'vue-waterfall/lib/waterfall'
  import WaterfallSlot from 'vue-waterfall/lib/waterfall-slot'
  import storage from "@/common/storage";
  import tabs from "@/common/tabs";

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
        topics: [],
        value: '',
        itemMeta: {
          margin: 10,
          content: 24,
          header: 35.2
        },
        options: [{
          value: '选项1',
          label: '黄金糕'
        }, {
          value: '选项2',
          label: '双皮奶'
        }, {
          value: '选项3',
          label: '蚵仔煎'
        }, {
          value: '选项4',
          label: '龙须面'
        }, {
          value: '选项5',
          label: '北京烤鸭'
        }],
      }
    },
    created() {
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

      /*tab*/
      tabRemove(listIndex, tabIndex) {
        this.lists[listIndex].tabs.splice(tabIndex, 1);
        if (this.lists[listIndex].tabs.length === 0)
          this.removeList(listIndex);
        this.storeLists()
      },
      storeLists: _.debounce(function () {
        console.time('store');
        this.$nextTick(() => {
          storage.setLists(this.lists).then(() => console.timeEnd('store'))
        })
      }, 200),
      restoreList(listIndex, inNewWindow = false) {
        if (inNewWindow) tabs.restoreListInNewWindow(this.lists[listIndex]);
        else tabs.restoreList(this.lists[listIndex]);
        if (this.lists[listIndex].pinned) return;
        this.removeList(listIndex)
      },
      //remove list
      removeList(listIndex) {
        this.lists.splice(listIndex, 1);
        this.storeLists()
      },
      renameList(listIndex, name) {
        const _this = this;
        this.$prompt('请输入名字', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /[^\s]/,
          inputValue: name,
          inputErrorMessage: '名字格式不正确'
        }).then(({value}) => {
          if (name === value.trim()) {
            return;
          }
          _this.lists[listIndex].title = value.trim();
          _this.storeLists();
          this.$message({type: 'success', message: '更改成功'});
        }).catch(() => {
          this.$message({type: 'info', message: '已取消更改'});
        });
      },
      /*todo cros*/
      tabSave(listIndex) {
        const _this = this;
        let list = _this.lists[listIndex];
        let tabs = [];
        if (list.tabs.length === 0) {
          this.$message({type: 'info', message: '已取消保存,没有书签可以保存'});
          return;
        }
        if (list.title === '') {
          this.$message({type: 'info', message: '已取消保存,请先设置名字'});
          return;
        }
        list.tabs.forEach((value) => {
          let tab = {};
          tab.favIconUrl = value.favIconUrl;
          tab.title = value.title;
          tab.url = value.url;
          tab.creationtime = new Date();
          tabs.push(tab);
        });

        $.ajax({
          type: "POST",
          url: urlTopicAdd,
          dataType: "json",
          contentType: "application/json", // 指定这个协议很重要
          data: JSON.stringify({topicTitle: list.title, tabs: tabs}), //只有这一个参数，json格式，后台解析为实体，后台可以直接用
          success: function (topic) {
            _this.$message({center: true, type: 'success', message: '保存成功!'});

            _this.addTopic(topic);

            _this.lists.splice(listIndex, 1);
            _this.storeLists();
          }
        })
      },

      // todo sort
      addTopic(topic) {
        this.topics.push(topic)
      },

      updateFolder(topic) {
        const _this = this;
        this.topics.forEach((value, index) => {
          if (value.id === topic.id) {
            _this.topics.splice(index, 1, topic);
            return;
          }
        })
      },
    },
    mounted() {
    }
  }
</script>
<style lang="stylus" scoped>
  .bookmark
    display flex
</style>
<style lang="stylus" scoped>
  .label-title
    width calc(100% - 24px * 3)

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
