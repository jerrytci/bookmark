<template>
  <div>
    <waterfall :grow="grow" :watch="lists" ref="waterfall" line-gap="">
      <waterfall-slot v-for="(list, index) in lists" :key="list.id"
                      :width="200" :height="200"
                      :order="index">
        <div>{{list.title}}</div>
        <div v-for="tab in list.tabs" :key="tab.id">
          <a>{{tab.title}}</a>
        </div>
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
      WaterfallSlot
    },
    data() {
      return {
        grow: [1, 1, 1, 1, 1],
        lists: []
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
    methods: {}
  }
</script>

<style lang="stylus" scoped>

</style>
