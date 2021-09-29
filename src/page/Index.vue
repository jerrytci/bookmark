<template>
  <div>
    <el-row>
      <el-col :span="6" style="background-color: #c0c4cc;">
        <el-scrollbar class="hidden-horizontal" style="height: calc(100vh - 30px)">
          <div v-for="(folder, folderIndex) in unsortBookmarks.slice().reverse()" :key="folder.id"
               :order="folderIndex"
          >
            <el-card class="box-card" :body-style="{padding: '0px'}" :style="{margin: _px(itemMeta.margin)}">
              <div v-if="folder.title !== bpf" class="label" style="width: inherit">
                <el-tooltip effect="dark" content="移到右边" placement="bottom">
                  <i class="el-icon-star-off" @click="moveFolder(folder.id, defaultDestinationFolder)"></i>
                </el-tooltip>
                <el-tooltip effect="dark" content="恢复列表" placement="bottom">
                  <i class="el-icon-position" @click="viewFolder(folder)"></i>
                </el-tooltip>
                <div class="label-title">
                  <a>{{folder.title === '' ? '未设置名字' : folder.title}}</a>
                </div>
                <i class="el-icon-close" @click="removeFolder(folder.id)"></i>
              </div>
              <div v-else class="label" style="width: inherit">
                <div class="bpf-label-title">
                  <a>{{folder.title === '' ? '未设置名字' : folder.title}}</a>
                </div>
              </div>
              <draggable :list="folder.children" :options="{animation:150}" group="unsort" @change="draggableLog">
                <div class="link" style="width: inherit" v-for="(tab, tabIndex) in folder.children" :key="tabIndex">
                  <div class="link-title">
                    <img :src="'chrome://favicon/size/16@2x/'+tab.url">
                    <a :href="tab.url" target="_blank" @click="removeBookmark(tab.id)">{{tab.title}}</a>
                  </div>
                  <i class="el-icon-close" @click="removeBookmark(tab.id)"></i>
                </div>
              </draggable>
            </el-card>
          </div>
        </el-scrollbar>
      </el-col>
      <el-col :span="18">
        <el-scrollbar style="height: calc(100vh - 30px);">
          <div style="padding-bottom: 100px;">
            <div v-for="(folder, folderIndex) in sortedBookmarks.slice().reverse()" :key="folder.id" :order="folderIndex"
              :height="itemHeight(folder.children.length)" :width="1">
              <div class="box-card" :body-style="{padding: '0px'}" :style="{margin: _px(itemMeta.margin)}">
                <div v-if="folder.title !== otherBK && folder.title !== otherBKen" class="label" style="width: inherit">
                  <!--todo 置顶-->
                  <i class="el-icon-edit-outline" v-if="selectedFolderIndex != folderIndex"
                    @click="displayFolderForm(folderIndex, folder.title)"></i>
                  <el-input v-if="selectedFolderIndex == folderIndex" class="item" @blur="modifyFolderTitle(folder.id)"
                    placeholder="请输入内容" v-model="folderTitle" :ref='"elInput"+folderIndex' clearable></el-input>
                  <div class="sorted-label-title" v-if="selectedFolderIndex != folderIndex">
                    <a>{{folder.title === '' ? '未设置名字' : folder.title}}</a>
                  </div>
                  <div class="label-menu" @click="moveFolder(folder.id, homeDestinationFolder)">移到首页</div>
                  <div class="label-menu" @click="viewFolder(folder)">恢复列表</div>
                  <div class="label-menu" @click="removeFolder(folder.id)">删除列表</div>
                </div>
                <div v-else class="label" style="width: inherit">
                  <div class="other-label-title">
                    <a @click="viewFolder(folder, storage.getOptions().open_in_new_window)">{{folder.title === '' ?
                      '未设置名字' : folder.title}}</a>
                  </div>
                </div>
                <el-row :gutter="10" style="width: inherit" :list="folder.children">
                  <draggable v-model="folder.children" :options="{ animation: 150}" group="sorted" @change="draggableLog">
                    <transition-group>
                      <el-col :span="6" v-for="(tab, tabIndex) in folder.children" :key="tabIndex">
                        <div class="link">
                          <div class="link-title">
                            <img :src="'chrome://favicon/size/16@2x/'+tab.url">
                            <a :href="tab.url" target="_blank">{{tab.title}}</a>
                          </div>
                          <i class="el-icon-close" @click="removeBookmark(tab.id)"></i>
                        </div>
                      </el-col>
                    </transition-group>
                  </draggable>
                </el-row>
                <!-- <draggable
            v-model="folder.children"
            :options="{ animation: 150 }"
            @change="draggableLog"
          >
            <transition-group tag="div" class="list" name="list">
              <div class="item" v-for="(tab, index) in folder.children" :index="index" :key="index">
                <div class="link">
                  <div class="link-title">
                    <img :src="'chrome://favicon/size/16@2x/'+tab.url">
                    <a :href="tab.url" target="_blank">{{tab.title}}</a>
                  </div>
                  <i class="el-icon-close" @click="removeBookmark(tab.id)"></i>
                </div>
              </div>
            </transition-group>
      </draggable> -->
              </div>
            </div>
          </div>
        </el-scrollbar>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import '@/assets/css/hidden-el-scrollbar-horizontal-bar.styl'
  import draggable from 'vuedraggable'
  import tabs from "@/common/onetab/tabs";
  import storage from "@/common/onetab/storage";

  export default {
    name: "Index",
    components: {
      draggable
    },
    data() {
      return {
        folderTitle:'',
        selectedFolderIndex:-1,
        sortedBookmarks: [],
        unsortBookmarks: [],
        newFolder: {children: []},

        defaultDestinationFolder: {
          parentId: "2",
        },
        homeDestinationFolder: {
          parentId: "1",
        },

        fromDraggable: false,

        grow: [1, 1, 1, 1],
        itemMeta: {
          margin: 10,
          content: 24,
          header: 35.2
        },
        bpf: "BPF",
        otherBK: "其他书签",
        otherBKen: "Other bookmarks"
      }
    },
    /*move: 在书签管理器操作会触发move callback; 在页面拖拽的bookmark通过'changed.change'实现*/
    created() {
      chrome.bookmarks.onCreated.addListener(this.appendNewFolderCallback);
      chrome.bookmarks.onChanged.addListener(this.changeFolderCallback);
      chrome.bookmarks.onMoved.addListener(this.moveCallback);
      chrome.bookmarks.onRemoved.addListener(this.removeCallback);
      this.getOther();
    },
    methods: {
      /*1 draggable*/
      /*added:newIndex,element*/
      /*removed:oldIndex,element*/
      /*moved:newIndex,oldIndex,element*/
      /*当拖拽跨越组时，先callback added,然后再callback removed。如果不跨组时,直接出现moved*/
      draggableLog(array) {
        if (typeof array.added !== 'undefined') {
          let obj = array.added;
          let bookmarkID = obj.element.id;
          let index = obj.newIndex;

          let parentId = this.newLocationRepeat(this.unsortBookmarks, index, bookmarkID);
          if (!parentId) this.newLocationRepeat(this.sortedBookmarks, index, bookmarkID);
          this.fromDraggable = true;
          this.moveFolder(bookmarkID, {parentId, index});
        } else if (typeof array.moved !== 'undefined') {
          let obj = array.moved;
          let bookmarkID = obj.element.id;
          let index = obj.newIndex;
          /*chrome.bookmark.move方法bug; 同组内: 如果从上往下拉标签，比如往下拖动了5个位置，实际上只拖动了4个位置。从下往上就正常。跨组正常*/
          /*resolve: 往下,index加1,不用担心越界问题。往上不处理*/
          let oldIndex = obj.oldIndex;
          if (oldIndex < index) index += 1;

          let parentId = obj.element.parentId;
          this.fromDraggable = true;
          this.moveFolder(bookmarkID, {"parentId": parentId, "index": index});
        }
      },
      newLocationRepeat(array, newIndex, bookmarkID) {
        for (let i = 0; i < array.length; i++) {
          let folder = array[i];
          if (folder.children.length > newIndex) {
            let ele = folder.children[newIndex];
            if (ele.id === bookmarkID) {
              return array[i].id;
            }
          }
        }
        return false;
      },

      /*2 bookmark*/
      /*remove, add(有,但在tab.storeTabs), update(没有,但是可以在chrome书签管理器操作), move*/
      removeBookmark(bookmarkID) {
        chrome.bookmarks.remove(bookmarkID);
      },

      /*3 folder*/
      /*remove, add(有,但在tab.storeTabs), update, move*/
      /*move: 目前只有一个move方向：unsorted -> sorted*/
      removeFolder(folderID) {
        chrome.bookmarks.removeTree(folderID);
      },
      moveFolder(id, destination, callback) {
        chrome.bookmarks.move(id, destination, callback);
      },
      modifyFolderTitle(folderID) {
        this.selectedFolderIndex = -1
        console.log(folderID)
        const _this = this;
          let value = this.folderTitle.trim()
          if(!value){
            return
          }
          let changes = {title: value.trim()};
          console.log(changes)
          _this.updateFolder(folderID, changes);
      },
      displayFolderForm(folderIndex, title) {
          this.folderTitle = title
          this.selectedFolderIndex = folderIndex
          this.$nextTick(() => {
            // dom元素更新后执行
            console.log(this.$refs['elInput'+folderIndex])
            this.$refs['elInput'+folderIndex][0].focus() // 改变了的值
        })
      },
      updateFolder(id, changes) {
        chrome.bookmarks.update(id, changes);
      },

      /*4 callback*/
      /*create(folder和bookmark是连在一起,因为bookmark需要folderID), move, update, delete*/
      moveCallback(id, moveInfo) {
        if (this.fromDraggable) {
          this.fromDraggable = false;
          return;
        }
        // todo to improve
        /*1 moved后要按照树节点顺序 部分内容要重新排序； 2 同个folder,只更新某个folder.children里面的顺序。*/
        /*let array = this.unsortBookmarks;
        let array2 = this.sortedBookmarks;
        for (let i = 0; i < array.length; i++) {
          if(array.id == )
        }
        */
        this.unsortBookmarks = [];
        this.sortedBookmarks = [];
        this.getOther();
      },
      removeCallback(id, removeInfo) {
        if (typeof removeInfo.node.url === 'undefined') {
          this.removeFolderCallback(id);
        } else {
          this.removeBookmarkCallBack(id, removeInfo);
        }
      },
      removeBookmarkCallBack(id, removeInfo) {
        let find = this.removeSubItem(this.unsortBookmarks, removeInfo.parentId, id);
        if (!find) this.removeSubItem(this.sortedBookmarks, removeInfo.parentId, id);
      },
      removeFolderCallback(id) {
        let find = this.removeItem(this.unsortBookmarks, id);
        if (!find) this.removeItem(this.sortedBookmarks, id);
      },
      removeItem(array, id) {
        for (let i = 0; i < array.length; i++) {
          if (array[i].id === id) {
            array.splice(i, 1);
            return true;
          }
        }
      },
      removeSubItem(array, id, bookmarkID) {
        for (let i = 0; i < array.length; i++) {
          if (array[i].id === id) {
            let folder = array[i];
            for (let j = 0; j < folder.children.length; j++) {
              if (folder.children[j].id === bookmarkID) {
                folder.children.splice(j, 1);
                return true;
              }
            }
          }
        }
      },

      changeFolderCallback(id, changes) { 
        if (typeof changes.url === 'undefined') {
          let find = this.updateItem(this.unsortBookmarks, id, changes.title);
          if (!find) this.updateItem(this.sortedBookmarks, id, changes.title);
        } else {
          chrome.bookmarks.get(id, (results) => {
            if (results.length === 0) {
              return true;
            } else {
              let parentId = results[0].parentId;
              let find = this.updateSubItem(this.unsortBookmarks, parentId, changes, id);
              if (!find) this.updateSubItem(this.sortedBookmarks, parentId, changes, id);
            }
          });
        }
      },
      updateItem(array, id, title) {
        for (let i = 0; i < array.length; i++) {
          if (array[i].id === id) {
            array[i].title = title;
            return true;
          }
        }
      },
      updateSubItem(array, id, changes, bookmarkID) {
        for (let i = 0; i < array.length; i++) {
          if (array[i].id === id) {
            let folder = array[i];
            for (let j = 0; j < folder.children.length; j++) {
              if (folder.children[j].id === bookmarkID) {
                if (typeof changes.url !== 'undefined') folder.children[j].url = changes.url;
                if (typeof changes.title !== 'undefined') folder.children[j].title = changes.title;
                return true;
              }
            }
          }
        }
      },

      /*新创建的添加到unsortBookmarks, 如果存在，则替换。每触发一个callback,都要判断是否存在(index0)*/
      appendNewFolderCallback(idStr, BookmarkTreeNode) {
        if (typeof BookmarkTreeNode.url === "undefined") {
          this.newFolder = BookmarkTreeNode;
          this.newFolder.children = [];
        } else {
          this.newFolder.children.push(BookmarkTreeNode);

          let index0 = -1;
          for (let i = this.unsortBookmarks.length - 1; i >= 0; i--) {
            if (this.unsortBookmarks[i].id === this.newFolder.id) {
              index0 = i;
              break;
            }
          }

          index0 === -1
            ? this.unsortBookmarks.push(this.newFolder)
            : this.unsortBookmarks.splice(index0, 1, this.newFolder);
        }
      },

      /*5 get data*/
      /*get other-bookmarks*/
      async getOther() {
        const _this = this;
        chrome.bookmarks.getSubTree("2", function (res) {
          let otherFolder = res[0];
          let resIncludeBPF = otherFolder.children.filter(i => i.title === "BPF");

          if (resIncludeBPF.length === 0) {
            _this.sortedBookmarks = _this.get(otherFolder);
          } else {
            let bpfFolder = resIncludeBPF[0];
            otherFolder.children.splice(bpfFolder.index, 1);

            _this.unsortBookmarks = _this.get(bpfFolder);
            _this.sortedBookmarks = _this.get(otherFolder);

            if (resIncludeBPF.length !== 1) {
              console.log('unsort只会显示排在最前面的"BPF"文件夹,其他的"BPF"文件夹将会显示在sorted,请保持有且仅有一个"BPF"文件夹');
            }
          }
        });
      },
      get(folder) {
        let res = [];
        let stack = [];
        let p = folder;
        stack.unshift(p);
        while (stack.length > 0) {
          p = stack.shift();
          let children = p.children;
          let tabs = children.filter((i) => typeof i.children === "undefined");
          let subFolders = children.filter((i) => typeof i.children !== "undefined");

          if (tabs.length !== 0) {
            p.children = tabs;
            res.push(p);
          }
          stack.unshift(...subFolders);
        }
        return res;
      },

      /* 还原整个列表 */
      async viewFolder(folder) {
        let opts = await storage.getOptions();
        let openInNew = opts.open_in_new_window;
        if (openInNew) {
          tabs.viewFolderInNewWindow(folder);
        } else {
          tabs.viewFolder(folder);
        }
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


<style>
  .item input {
    border-radius: 0px !important;
    border: none;
    color: #303133;
    font-weight: bold;
  }
</style>

<style lang="stylus" scoped>
  .list {
    list-style-type: none;
    padding: 0;
    text-align: left;
    width: inherit;
  }
  .item {
    display: inline-block;
    border-radius: 0px;
    width 25%
  }

  .el-main
    padding 0px
    margin 0px
  .label-title
    width calc(100% - 24px * 3)

  .sorted-label-title
    width 50%
      
  .label-menu {
    align-items: center;
    padding 8px 10px;
    color #999;
    font-size 12px;
    &:hover {
      cursor:pointer
      background-color rgb(235, 235, 235)
    }
  }

  .bpf-label-title
  .other-label-title
    width calc(100%)

  /*10:padding.*/
  .link-title
    width calc(100% - 24px - 10px * 2)
    & > a
      width 100%
  .label
    display flex
    font-weight bold
    font-size 14px
    & > i
      padding 10px 5px
      &:hover
        cursor:pointer
        background-color rgb(235, 235, 235)
    & > div
      display flex
      & > a
        padding 8px 10px;
        /* &:hover
          background-color rgb(235, 235, 235) */

  .link
    font-size 12px
    background: #f5f7fa;
    border: 1px solid #e4e7ed;
    margin: 3px;
    padding 3px;
    display flex
    &:hover
      background-color: #ffffff;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1)
      & > i
        display inline
    & > i
      padding 6px
      display none
    & > div
      display flex
      padding 4px 10px;
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
