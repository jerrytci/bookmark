<template>
  <el-main class="box-content" style="padding-bottom: 100px;">
    <el-scrollbar class="hidden-horizontal">
      <div class="search">
        <div class="searchBar">
          <el-popover
          ref="popover"
          placement="bottom"
          title="搜索内容"
          width="300"
          trigger="manual"
          v-model="iconHover">
          <el-radio-group @change="setSearchIcon" v-model="searchRadio">
            <el-radio label="1" @click.native="iconHover = false">全部书签</el-radio>
            <el-radio label="2" @click.native="iconHover = false">当前书签</el-radio>
            <el-radio label="3" @click.native="iconHover = false">百度搜索</el-radio>
          </el-radio-group>
        </el-popover>
          <el-input @keydown.enter.native="searchInput" v-model="input" placeholder="请输入内容" @input="inputValue">
            <i slot="prefix" @click="iconHover = true"  v-popover:popover style="display: flex;align-items: center;height: 100%;padding-left:5px;"><img :src="searchIcon"></i>
        </el-input>
        <el-button @click="searchInput" type="primary" round>搜索</el-button></el-input>
        </div>
      </div>
      
      <div v-for="(folder, folderIndex) in sortedBookmarks" :key="folder.id" :order="folderIndex"
        :height="itemHeight(folder.children.length)" :width="1">
        <div class="box-card" :body-style="{padding: '0px'}" :style="{margin: _px(itemMeta.margin)}">
          <div v-if="folder.id !== -1" class="label" style="width: inherit">
            <i class="el-icon-edit-outline" v-if="selectedFolderIndex != folderIndex"
              @click="displayFolderForm(folderIndex, folder.title)"></i>
            <el-input v-if="selectedFolderIndex == folderIndex" class="item" @blur="modifyFolderTitle(folder.id)"
              placeholder="请输入内容" v-model="folderTitle" :ref='"elInput"+folderIndex' clearable></el-input>
            <div class="sorted-label-title" v-if="selectedFolderIndex != folderIndex">
              <a>{{folder.title === '' ? '未设置名字' : folder.title}}</a>
            </div>
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
        </div>
      </div>
    </el-scrollbar>
  </el-main>
</template>

<script>
  import draggable from 'vuedraggable'
  import storage from "@/common/onetab/storage";
  import _ from 'lodash';
  import tabs from "@/common/onetab/tabs";

  export default {
    components: {
      draggable
    },
    data() {
      return {
        searchRadio: '1',
        searchIcon:'',
        iconHover: false,
        input: this.$route.query.search,
        folderTitle: '',
        selectedFolderIndex: -1,
        itemMeta: {
          margin: 10,
          content: 24,
          header: 35.2
        },
        sortedBookmarks: [],
        searchBookmarks: [],
        newFolder: {
          children: []
        },
      };
    },
    created() {
      this.init();
      this.getBookmarks();
      chrome.bookmarks.onChanged.addListener(this.changeFolderCallback);
      chrome.bookmarks.onMoved.addListener(this.moveCallback);
      chrome.bookmarks.onRemoved.addListener(this.removedCallback);
    },
    methods: {
      inputValue(){
        console.log("inputValue")
        if (!this.input) {
          this.sortedBookmarks = this.searchBookmarks
          return
        }
        const _this = this;
        switch (this.searchRadio) {
          case "1":
            chrome.bookmarks.search(this.input, function (bookmarkTreeNodes) {
              _this.sortedBookmarks = [{ title: "全部标签", id: -1, children: bookmarkTreeNodes }];
            });
            break
          case "2":
            this.tempBookmarks =  _.cloneDeep(this.searchBookmarks);
            this.sortedBookmarks = this.tempBookmarks.filter((bookmark) => {
              bookmark.children = bookmark.children.filter((book) => {
                return String(book.title).toLowerCase().indexOf(_this.input.toLowerCase()) !== -1 || String(book.url).toLowerCase().indexOf(_this.input.toLowerCase()) !== -1
              });
              return bookmark.children.length > 0
            })
            break
        }

      },
      searchInput(){
        if (!this.input) {
          this.sortedBookmarks = this.searchBookmarks
          return
        }
        switch (this.searchRadio){
          case "1":
            chrome.bookmarks.search(this.input, function (bookmarkTreeNodes) {
              _this.sortedBookmarks = [{ title: "全部标签", id: -1, children: bookmarkTreeNodes }];
            });
            break
          case "2":
            const _this = this;
            this.tempBookmarks =  _.cloneDeep(this.searchBookmarks);
            this.sortedBookmarks = this.tempBookmarks.filter((bookmark) => {
              bookmark.children = bookmark.children.filter((book) => {
                return String(book.title).toLowerCase().indexOf(_this.input.toLowerCase()) !== -1 || String(book.url).toLowerCase().indexOf(_this.input.toLowerCase()) !== -1
              });
              return bookmark.children.length > 0
            })
            break
          case "3":
            window.open(`https://www.baidu.com/s?wd=${this.input}`)
            break
        }
      },
      async setSearchIcon(){
        this.iconHover=false;
        switch (this.searchRadio){
          case "1":
            this.searchIcon = "/assets/icons/bm_icon_all.png";
            break
          case "2":
            this.searchIcon = "/assets/icons/bm_icon.png";
            break
          case "3":
            this.searchIcon = "chrome://favicon/size/8@2x/https://www.baidu.com";
            break
        }
        await storage.setUOptions({'searchRadio':this.searchRadio}) 

      },
      async init() {
        let dataU = await storage.getUOptions('searchRadio')
        if(dataU.searchRadio){
          this.searchRadio = dataU.searchRadio
        }
        this.setSearchIcon()
      },
      async getBookmarks() {
        const _this = this;
        let data = await storage.getUOptions('transfer') //获取右边的数据
        let transfer = data.transfer
        chrome.bookmarks.getTree(function (res) {
          let otherFolder = res[0];
          let all = _this.get(otherFolder);
          if (transfer) {
            _this.sortedBookmarks = all.filter((bookmark) => {
              return transfer.indexOf(bookmark.title) === -1
            })
          } else {
            _this.sortedBookmarks = all
          }
          _this.searchBookmarks = _this.sortedBookmarks
          _this.inputValue();
        })
      },
      get(folder) {
        let res = [];
        let stack = [];
        let p = folder;
        stack.unshift(p);
        while (stack.length > 0) {
          p = stack.shift();
          if (p.id != "2") {
            let children = p.children;
            let tabs = children.filter((i) => typeof i.children === "undefined");
            let subFolders = children.filter((i) => typeof i.children !== "undefined");

            if (tabs.length !== 0) {
              p.children = tabs;
              res.push(p);
            }
            stack.unshift(...subFolders);
          }

        }
        return res;
      },
      _px(param) {
        return param + 'px';
      },
      itemHeight: function (linkCount) {
        return linkCount * this.itemMeta.content + this.itemMeta.header + this.itemMeta.margin * 2;
      },
      // 文件夹修改回调
      changeFolderCallback(id, changes) {
        if (typeof changes.url === 'undefined') {
          this.updateItem(this.sortedBookmarks, id, changes.title);
        } else {
          chrome.bookmarks.get(id, (results) => {
            if (results.length === 0) {
              return true;
            } else {
              let parentId = results[0].parentId;
              this.updateSubItem(this.sortedBookmarks, parentId, changes, id);
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
      /*4 callback*/
      /*create(folder和bookmark是连在一起,因为bookmark需要folderID), move, update, delete*/
      moveCallback(id, moveInfo) {
        if (this.fromDraggable) {
          this.fromDraggable = false;
          return;
        }
      },
      // 删除成功回调，自己处理本地数据
      removedCallback(id, removeInfo) {
        if (typeof removeInfo.node.url === 'undefined') {
          this.removeFolderCallback(id);
        } else {
          this.removeBookmarkCallBack(id, removeInfo);
        }
      },
      removeBookmarkCallBack(id, removeInfo) {
        this.removeSubItem(this.sortedBookmarks, removeInfo.parentId, id);
      },
      removeFolderCallback(id) {
        this.removeItem(this.sortedBookmarks, id);
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
      /*1 draggable*/
      /*added:newIndex,element*/
      /*removed:oldIndex,element*/
      /*moved:newIndex,oldIndex,element*/
      /*当拖拽跨越组时，先callback added,然后再callback removed。如果不跨组时,直接出现moved*/
      draggableLog(array) {
        if (typeof array.added !== 'undefined') {
          console.log("added")
          let obj = array.added;
          let bookmarkID = obj.element.id;
          let index = obj.newIndex;
          let parentId = this.newLocationRepeat(this.sortedBookmarks, index, bookmarkID);
          this.fromDraggable = true;
          this.moveFolder(bookmarkID, {
            parentId,
            index
          });
        } else if (typeof array.moved !== 'undefined') {
          console.log("moved")
          let obj = array.moved;
          let bookmarkID = obj.element.id;
          let index = obj.newIndex;
          /*chrome.bookmark.move方法bug; 同组内: 如果从上往下拉标签，比如往下拖动了5个位置，实际上只拖动了4个位置。从下往上就正常。跨组正常*/
          /*resolve: 往下,index加1,不用担心越界问题。往上不处理*/
          let oldIndex = obj.oldIndex;
          if (oldIndex < index) index += 1;

          let parentId = obj.element.parentId;
          this.fromDraggable = true;
          this.moveFolder(bookmarkID, {
            "parentId": parentId,
            "index": index
          });
        }
      },
      // 获取所在位置的parentId
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
        if (!value) {
          return
        }
        let changes = {
          title: value.trim()
        };
        console.log(changes)
        _this.updateFolder(folderID, changes);
      },
      displayFolderForm(folderIndex, title) {
        this.folderTitle = title
        this.selectedFolderIndex = folderIndex
        this.$nextTick(() => {
          // dom元素更新后执行
          console.log(this.$refs['elInput' + folderIndex])
          this.$refs['elInput' + folderIndex][0].focus() // 改变了的值
        })
      },
      updateFolder(id, changes) {
        chrome.bookmarks.update(id, changes);
      },
      async viewFolder(folder) {
        let opts = await storage.getOptions();
        let openInNew = opts.open_in_new_window;
        if (openInNew) {
          tabs.viewFolderInNewWindow(folder);
        } else {
          tabs.viewFolder(folder);
        }
      },
    },
  };
</script>

<style>
.search input {
  border-radius: 30px 0 0 30px !important;
}
.search .el-button {
  border-radius: 0 30px 30px 0 !important;
}
</style>
<style lang="stylus" scoped>
.search {
  display: flex;
  align-items:center;
  flex-flow: column;
  height: 300px;
}
.searchBar
    width: 600px;
    display: flex;
    align-items:center;
    position:fixed !important;
    margin-top: 40px !important;
    z-index: 999;
.search-box 
    position:fixed !important;
    margin-top: 40px !important;

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
    display: none;
    align-items: center;
    padding 8px 10px;
    color #999;
    font-size 12px;
    &:hover {
      cursor:pointer
      background-color rgb(235, 235, 235)
    }
  }

  /*10:padding.*/
  .link-title
    width calc(100% - 24px - 10px * 2)
    & > a
      width 100%
  .label
    display flex
    font-weight bold
    font-size 14px
    &:hover
      .label-menu
          display flex
    & > i
      padding 10px 5px
      &:hover
        cursor:pointer
        background-color rgb(235, 235, 235)
    & > div
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