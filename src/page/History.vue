<template>
    <div class="box-card">
        <div class="searchbar">
          <el-input class="title" @input="filterHistory" placeholder="请输入筛选内容" v-model="searchContent" ></el-input>
          <i class="el-icon-search" style="padding: 3px"></i>
        </div>
        <el-scrollbar>
            <div style="max-height: 500px;">
                <div v-for="item in historyItems" :key="item.id" class="item" @click="open(item.url)" >
                    <div class="htitle">
                        <img :src="'chrome://favicon/size/16@2x/'+item.url" class="icon">
                        {{item.title}}
                    </div>
                    <div class="url">
                        {{item.url}}
                    </div>
                </div>
            </div>
        </el-scrollbar>
      </div>
</template>

<script>
    import storage from "@/common/onetab/storage";
    import options from "@/common/util/options";
    import __ from "@/common/util/i18n";
    import _ from "lodash";
    import utils from "@/common/util/utils";

    export default {
        data() {
            return {
                options: {},
                searchContent: "",
                quotaExceeded: false,
                searchItems: [],
                historyItems: [],
                historyNum: 10,
                historyTime:7,
            };
        },
        created() {
            this.init();
        },
        methods: {
            async init() {

                let dataT = await storage.getUOptions('historyTime')
                if(dataT.historyTime){
                    this.historyTime = dataT.historyTime;
                } else {
                    await storage.setUOptions({historyTime:this.historyTime})
                }
                const microsecondsPerWeek = 1000 * 60 * 60 * 24 * this.historyTime;
                let dataN = await storage.getUOptions('historyNum')
                if(dataN.historyNum){
                    this.historyNum = dataN.historyNum;
                } else {
                    await storage.setUOptions({historyNum:this.historyNum})
                }

                const currentTab = await utils.asyncWorker(
                    new Promise((resolve) =>
                        chrome.tabs.query({
                            currentWindow: true,
                            active: true,
                        }, tabs => resolve(tabs[0]))
                    )
                );
                const domain = utils.getDomain(currentTab[1].url);
                console.log(domain)
                if(!domain){
                    return
                }
                
                const oneWeekAgo = (new Date).getTime() - microsecondsPerWeek;
                function toVisitedItem(item) {
                    return {
                        key: item.id,
                        domain: utils.getUrlDomain(item.url),
                        title: item.title,
                        url: item.url,
                        lastVisitTime: item.lastVisitTime,
                    };
                }
                const visitedItems = await utils.asyncWorker(
                    new Promise((resolve) =>
                        chrome.history.search({
                            text: '',
                            maxResults: 0,
                            startTime: oneWeekAgo,
                        }, items => resolve(items.map(toVisitedItem)))
                    )
                );
                this.historyItems = await this.getHistoryItems(visitedItems[1],domain,this.historyNum)
                this.searchItems = this.historyItems
         
            },
            async getHistoryItems(visitedItems,domain, limit) {
                let items = visitedItems
                if(domain){
                    const tail = '.' + utils.getMainDomain(domain);
                    console.log(tail)
                    items = items.filter(item => item.domain === domain || item.domain.endsWith(tail));
                }
                if (limit) {
                    items = items.slice(0, limit);
                }
                return items;
            },

            filterHistory(){
                this.historyItems = this.searchItems.filter(item => {
                    return item.url.indexOf(this.searchContent) !== -1 || item.title.indexOf(this.searchContent) !== -1 
                })
            },
            open(url){
                window.open(url,'_blank');
            },
            itemHeight: function (linkCount) {
                return linkCount * 63;
            },
        }

    };
</script>
<style>
    .title input {
      border-radius: 0px !important;
      border: none;
      color: #303133;
      font-weight: bold;
    }
  </style>
<style lang="stylus" scoped>

    .el-card /deep/ .el-card__body {
        padding: 0px !important;
    }
    .text {
        font-size: 14px;
    }

    .item 
        font-size: 14px;
        padding: 10px;
        &:hover 
            cursor:pointer
            background-color rgb(235, 235, 235)
        

    .htitle {
        display:flex;
        font-weight: bold;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .icon {
        display: inline-block;
        margin-right: 0.8em;
        width: 1.25em;
        vertical-align: text-bottom;
    }

    .url {
        margin-top: 5px;
        margin-left: 2.05em;
        color: rgb(153, 153, 153);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .clearfix:before,
    .clearfix:after {
        display: table;
        content: "";
    }

    .clearfix:after {
        clear: both
    }

    .searchbar {
        display: flex;
        align-items:center;
        padding: 8px 12px;
        border-bottom: 1px solid #EBEEF5;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
    }

    .box-card {
        width: 480px;
    }
</style>