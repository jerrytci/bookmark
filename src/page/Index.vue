<template>
  <div>
    <el-row>
      <el-col :span="7">
        <el-scrollbar class="hidden-horizontal" style="height: 100vh" :native="false">
          <div v-for="(folder, folderIndex) in unsortBookmarks" :key="folder.id"
               :order="folderIndex"
               v-if="folder.children.length !== 0"
          >
            <el-card class="box-card" :body-style="{padding: '0px'}" :style="{margin: _px(itemMeta.margin)}">
              <div class="label" style="width: inherit">
                <i class="el-icon-star-off" @click="moveFolder(folder.id, defaultDestinationFolder)"></i>
                <i class="el-icon-edit-outline" @click="renameList(folderIndex, folder.title)"></i>
                <div class="label-title">
                  <a @click="restoreList(folderIndex, true)">{{folder.title === '' ? '未设置名字' : folder.title}}</a>
                </div>
                <i class="el-icon-remove-outline" @click="removeList(folderIndex)"></i>
              </div>
              <div class="link" style="width: inherit" v-for="(tab, tabIndex) in folder.children">
                <div class="link-title">
                  <img :src="'chrome://favicon/size/16@2x/'+tab.url">
                  <a :href="tab.url" target="_blank">{{tab.title}}</a>
                </div>
                <i class="el-icon-remove-outline" @click="tabRemove(folderIndex, tabIndex)"></i>
              </div>
            </el-card>
          </div>
        </el-scrollbar>
      </el-col>
      <el-col :span="17">
        <el-scrollbar class="hidden-horizontal" style="height: 100vh">
          <waterfall :grow="grow" ref="waterfall" line-gap="" :fixed-height="true">
            <waterfall-slot v-for="(folder, folderIndex) in sortedBookmarks" :key="folder.id"
                            :order="folderIndex"
                            :height="itemHeight(folder.children.length)"
                            :width="1"
                            v-if="folder.children.length !== 0"
            >
              <el-card class="box-card" :body-style="{padding: '0px'}" :style="{margin: _px(itemMeta.margin)}">
                <div class="label" style="width: inherit">
                  <i class="el-icon-star-off" @click="saveList(folderIndex)"></i>
                  <i class="el-icon-edit-outline" @click="renameList(folderIndex, folder.title)"></i>
                  <div class="label-title">
                    <a @click="restoreList(folderIndex, true)">{{folder.title === '' ? '未设置名字' : folder.title}}</a>
                  </div>
                  <i class="el-icon-remove-outline" @click="removeList(folderIndex)"></i>
                </div>
                <div class="link" style="width: inherit" v-for="(tab, tabIndex) in folder.children">
                  <div class="link-title">
                    <img :src="'chrome://favicon/size/16@2x/'+tab.url">
                    <a :href="tab.url" target="_blank">{{tab.title}}</a>
                  </div>
                  <i class="el-icon-remove-outline" @click="tabRemove(folderIndex, tabIndex)"></i>
                </div>
              </el-card>
            </waterfall-slot>
          </waterfall>
        </el-scrollbar>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import '@/assets/css/hidden-el-scrollbar-horizontal-bar.styl'
  import Waterfall from 'vue-waterfall/lib/waterfall'
  import WaterfallSlot from 'vue-waterfall/lib/waterfall-slot'

  export default {
    name: "Index",
    components: {
      Waterfall,
      WaterfallSlot
    },
    data() {
      return {
        sortedBookmarks: [],
        unsortBookmarks: [],

        grow: [1, 1, 1, 1],

        defaultDestinationFolder: {
          parentId: "2",
        },
        itemMeta: {
          margin: 10,
          content: 24,
          header: 35.2
        },
      }
    },
    created() {
      this.getOther();
    },
    methods: {
      get(folder, res) {
        let f = {};
        f.dateAdded = folder.dateAdded;
        f.dateGroupModified = folder.dateGroupModified;
        f.id = folder.id;
        f.title = folder.title;
        f.children = [];

        folder.children.forEach((item) => {
          if (typeof item.children === 'undefined') {
            f.children.push(item);
          } else {
            this.get(item, res);
          }
        });
        res.push(f);
      },
      getOther() {
        const _this = this;
        chrome.bookmarks.getSubTree("2", function (res) {
          let otherFolder = res[0];
          let resIncludeBPF = otherFolder.children.filter(i => i.title === "BPF");

          if (resIncludeBPF.length === 0) {
            _this.get(otherFolder, _this.sortedBookmarks);
          } else {
            let bpfFolder = resIncludeBPF[0];
            otherFolder.children.splice(bpfFolder.index, 1);

            _this.get(bpfFolder, _this.unsortBookmarks);
            _this.get(otherFolder, _this.sortedBookmarks);

            if (resIncludeBPF.length !== 1) {
              console.log('unsort只会显示排在最前面的"BPF"文件夹,其他的"BPF"文件夹将会显示在sorted,请保持有且仅有一个"BPF"文件夹');
            }
          }
        });
      },

      moveFolder(id, destination, callback){
        chrome.bookmarks.move(id, destination, callback);
      },

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
