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
                <i class="el-icon-edit-outline" @click="displayUpdateFolderForm(folder.id, folder.title)"></i>
                <div class="label-title">
                  <!--<a @click="restoreList(folderIndex, true)">{{folder.title === '' ? '未设置名字' : folder.title}}</a>-->
                  <a @click="test(folderIndex, true)">{{folder.title === '' ? '未设置名字' : folder.title}}</a>
                </div>
                <i class="el-icon-remove-outline" @click="removeFolder(folder.id)"></i>
              </div>
              <draggable :list="folder.children" group="unsort" @change="draggableLog">
                <div class="link" style="width: inherit" v-for="(tab, tabIndex) in folder.children">
                  <div class="link-title">
                    <img :src="'chrome://favicon/size/16@2x/'+tab.url">
                    <a :href="tab.url" target="_blank">{{tab.title}}</a>
                  </div>
                  <i class="el-icon-remove-outline" @click="removeBookmark(tab.id)"></i>
                </div>
              </draggable>
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
                  <i class="el-icon-edit-outline" @click="displayUpdateFolderForm(folder.id, folder.title)"></i>
                  <div class="label-title">
                    <a @click="restoreList(folderIndex, true)">{{folder.title === '' ? '未设置名字' : folder.title}}</a>
                  </div>
                  <i class="el-icon-remove-outline" @click="removeFolder(folder.id)"></i>
                </div>
                <draggable :list="folder.children" group="sorted" @change="draggableLog">
                  <div class="link" style="width: inherit" v-for="(tab, tabIndex) in folder.children">
                    <div class="link-title">
                      <img :src="'chrome://favicon/size/16@2x/'+tab.url">
                      <a :href="tab.url" target="_blank">{{tab.title}}</a>
                    </div>
                    <i class="el-icon-remove-outline" @click="removeBookmark(tab.id)"></i>
                  </div>
                </draggable>
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
  import draggable from 'vuedraggable'

  export default {
    name: "Index",
    components: {
      Waterfall,
      WaterfallSlot,
      draggable
    },
    data() {
      return {
        sortedBookmarks: [],
        unsortBookmarks: [],
        newFolder: {children: []},

        changed: {
          change: false,
          bookmark: {},
          index: false,
          newFolderID: '',
        },

        moved: {
          change: false,
          bookmark: {},
          index: false,
        },

        defaultDestinationFolder: {
          parentId: "2",
        },

        grow: [1, 1, 1, 1],
        itemMeta: {
          margin: 10,
          content: 24,
          header: 35.2
        },
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
    watch: {
      /*find new location by unsortBookmarks || sortedBookmarks*/
      'changed.change'(newQuestion, oldQuestion) {
        if (newQuestion) {
          this.newLocation();
          this.moveFolder(this.changed.bookmark.id,
            {parentId: this.changed.newFolderID, index: this.changed.index});
          this.changed = {
            change: false,
            bookmark: {},
            index: false,
            newFolderID: ''
          };
        }
      },
    },
    methods: {
      /*draggable*/
      /*added:newIndex,element*/
      /*removed:oldIndex,element*/
      /*moved:newIndex,oldIndex,element*/
      /*当拖拽跨越组时，先callback added,然后再callback removed。如果不跨组时,直接出现moved*/
      draggableLog(array) {
        if (typeof array.added !== 'undefined') {
          this.changed.bookmark = array.added.element;
          this.changed.index = array.added.newIndex;
          this.changed.change = true;
        } else if (typeof array.moved !== 'undefined') {
          console.log("test here");
        }
      },
      newLocation() {
        let find = this.newLocationRepeat(this.unsortBookmarks);
        if (!find) this.newLocationRepeat(this.sortedBookmarks);
      },
      newLocationRepeat(array) {
        for (let i = 0; i < array.length; i++) {
          let folder = array[i];
          if (folder.children.length > this.changed.index) {
            let ele = folder.children[this.changed.index];
            if (ele.id === this.changed.bookmark.id) {
              this.changed.newFolderID = array[i].id;
              return true;
            }
          }
        }
        return false;
      },

      /*bookmark*/
      /*remove, add(有,但在tab.storeTabs), update(没有,但是可以在chrome书签管理器操作), move(todo)*/
      removeBookmark(bookmarkID) {
        chrome.bookmarks.remove(bookmarkID);
      },

      /*folder*/
      /*remove, add(有,但在tab.storeTabs), update, move*/
      /*move: 目前只有一个move方向：unsorted -> sorted*/
      removeFolder(folderID) {
        chrome.bookmarks.removeTree(folderID);
      },
      moveFolder(id, destination, callback) {
        chrome.bookmarks.move(id, destination, callback);
      },
      displayUpdateFolderForm(folderID, title) {
        const _this = this;
        this.$prompt('请输入名字', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /[^\s]/,
          inputValue: title,
          inputErrorMessage: '名字格式不正确'
        }).then(({value}) => {
          if (title === value.trim()) {
            return;
          }
          let changes = {title: value.trim()};
          _this.updateFolder(folderID, changes);
          this.$message({type: 'success', message: '更改成功', duration: 850});
        }).catch(() => {
          this.$message({type: 'info', message: '已取消更改', duration: 700});
        });
      },
      updateFolder(id, changes) {
        chrome.bookmarks.update(id, changes);
      },

      /*callback*/
      /*create(folder和bookmark是连在一起,因为bookmark需要folderID), move, update, delete*/
      moveCallback(id, moveInfo) {
        this.sortedBookmarks = [];
        this.unsortBookmarks = [];
        this.getOther();

        // todo
        console.log("test here");
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


      get(folder, res) {
        let children = folder.children;
        let tabs = children.filter(i => typeof i.children === 'undefined');
        let subFolders = children.filter(i => typeof i.children !== 'undefined');

        if (tabs.length !== 0) {
          folder.children = tabs;
          res.push(folder);
        }

        if (subFolders.length !== 0) {
          subFolders.map(i => this.get(i, res));
        }
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

      test() {
        console.log("test here");
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
