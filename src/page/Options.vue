<template>
  <div class="box">
    <el-row class="box-content">
      <el-col :span="18" :offset="3" class="setting">
        <el-card
          class="box-card"
          v-for="(optionsList, cate) in optionsLists"
          :key="optionsList.name"
        >
          <div slot="header" class="clearfix">
            <span>{{ __("ui_options_" + cate) }}</span>
          </div>
          <div v-for="(option, optionIndex) in optionsList" :key="optionIndex">
            <el-row :gutter="20" class="options">
              <el-col :span="16">
                <span>{{ option.desc }}</span>
                <strong
                  v-if="option.name === 'syncList' && quotaExceeded"
                  :style="{ color: 'red', paddingLeft: '8px' }"
                  >quota exceeded!</strong
                >
              </el-col>
              <el-col :span="8">
                <el-select
                  v-if="option.type === String"
                  v-model="options[option.name]"
                  @change="optionsChanged(option.name, $event)"
                  class="select-amend"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="item in option.items"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>

                <el-switch
                  v-if="option.type === Boolean"
                  v-model="options[option.name]"
                  @change="optionsChanged(option.name, $event)"
                  class="switch-amend"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                >
                </el-switch>
              </el-col>
            </el-row>
          </div>
        </el-card>
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>{{ "标签" }}</span>
          </div>
          <div
            style="display: flex;justify-content: center; align-items: center;"
          >
            <el-transfer
              :titles="['显示标签', '隐藏标签']"
              v-model="value"
              :data="dataFransfer"
              @change="transferChange"
            ></el-transfer>
          </div>
        </el-card>
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>{{ "历史记录" }}</span>
          </div>
          <el-row :gutter="20" class="options">
            <el-col :span="16">
              <span>{{ "相距当前时间" }}</span>
            </el-col>
            <el-col :span="8">
              <el-input-number v-model="historyTime" @blur="historyTimeChange" :min="7" size="mini"  :precision="0"></el-input-number>
              <span>{{ "天" }}</span>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="options">
            <el-col :span="16">
              <span>{{ "显示记录条数" }}</span>
            </el-col>
            <el-col :span="8">
              <el-input-number v-model="historyNum" @blur="historyNumChange" :min="10" size="mini" controls-position="right" :precision="0"></el-input-number>
              <span>{{ "条" }}</span>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import storage from "@/common/onetab/storage";
import options from "@/common/util/options";
import __ from "@/common/util/i18n";
import _ from "lodash";
import asyncWorker from "@/common/util/utils";

export default {
  data() {
    return {
      optionsLists: _.groupBy(options.optionsList, "cate"),
      options: {},
      snackbar: false,
      quotaExceeded: false,
      dataFransfer: [],
      value: [],
      bookmarkFolders: [],
      historyNum: 10,
      historyTime:7,
    };
  },
  created() {
    this.init();
    this.getBookmarkFolders();
  },
  methods: {
    __,
    optionsChanged: _.debounce(async function(key, value) {
      await storage.setOptions(this.options);
      chrome.runtime.sendMessage({
        optionsChanged: {
          [key]: value,
        },
      });
    }, 100),
    async init() {
      const opts = await storage.getOptions();
      Object.keys(opts).map((key) => { 
        this.$set(this.options, key, opts[key]);
      });
      chrome.runtime.onMessage.addListener((msg) => {
        if (msg.optionsChangeHandledStatus === "success") {
          this.snackbar = true;
        }
      });
      this.quotaExceeded = storage.isQuotaExceeded();
      let dataT = await storage.getUOptions('historyTime')
      if(dataT.historyTime){
        this.historyTime = dataT.historyTime;
      }

      let dataN = await storage.getUOptions('historyNum')
      if(dataN.historyNum){
        this.historyNum = dataN.historyNum;
      }
    },
    async getBookmarkFolders() {
      const _this = this;
      let data = await storage.getUOptions('transfer')  //获取右边的数据
      let transfer = data.transfer
      console.log(transfer)
      chrome.bookmarks.getTree(function(res) {
        let otherFolder = res[0]; 
        _this.bookmarkFolders = _this.getTitle(otherFolder); //获取全部文件夹
        _this.bookmarkFolders.forEach(function callbackFn(element, index) {
          _this.dataFransfer.push({ key: index, label: `${element}`}); //加载全部文件夹
          if(transfer){
            transfer.forEach(function callback(e, j) {
                if(e == element){  //加载右边文件夹
                    _this.value.push(index)
                }
            });
          }
        });
      });
    },
    getTitle(folder) {
      let res = [];
      let stack = [];
      let p = folder;
      stack.unshift(p);   /*从数组前面插入数据*/
      while (stack.length > 0) {
         p = stack.shift(); //从数组前面获取数据
         if(p.id != "2"){
            let children = p.children;
            let tabs = children.filter((i) => typeof i.children === "undefined");
            let subFolders = children.filter((i) => typeof i.children !== "undefined");

            if (tabs.length !== 0) {
              p.children = tabs;
              res.push(p.title);
            }
            stack.unshift(...subFolders); /*从数组前面批量...插入数据（坑：不会导致数据长度为数组）*/
          } 
      }
      return res;
    },
    async transferChange(){
      // 保存右边的数据
      let data = this.value.map((i) => this.dataFransfer[i].label)
      await storage.setUOptions({transfer:data})
    },
    async historyTimeChange(){
      await storage.setUOptions({historyTime:this.historyTime})
    },
    async historyNumChange() {
      await storage.setUOptions({historyNum:this.historyNum})
    }
  },
};
</script>
<style lang="stylus" scoped>
.setting {
  padding-top: 50px;
  font-size: 16px;
  padding-bottom: 100px;
}

.box-card {
  margin-top: 20px;
}

.select-amend {
  padding: 4px 0 0;
}

.switch-amend {
  height: 100%;
  div {
    height: 100%;
  }
}

.options {
  & > div {
    &.el-col {
      padding: 10px 0;
    }
  }
}
</style>
