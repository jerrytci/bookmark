<template>
    <div class="box-content" style="padding:30px;">
        <div class="search">
            <div class="searchbar">
                <el-input @input="filterExt" placeholder="请输入筛选内容" v-model="searchContent" suffix-icon="el-icon-search"></el-input>
            </div>
        </div>

        <el-row :gutter="0" :list="extensions" style="padding-Top: 100px;">
            <el-col :span="6" v-for="(ext, tabIndex) in extensions" :key="tabIndex">
                <el-card class="item-card" :style="{'background-color': ext.enabled ? '': 'rgb(235, 235, 235) '}">
                    <div class="htitle">
                        <img :src="getIconUrl(ext.icons)" class="icon">
                        <a :href="ext.homepageUrl" target="_blank">{{ext.name}}</a>
                    </div>
                    <el-scrollbar>
                        <div class="description">
                            {{ext.description}}
                        </div> 
                    </el-scrollbar>
                    <div class="buttonBox">
                        <div class="button">
                            <el-button @click="clickInfo(ext)" size="mini" type="info" icon="el-icon-star-off" circle></el-button>
                            <el-button @click="clickDelete(ext)" size="mini" type="danger" icon="el-icon-delete" circle></el-button>
                        </div>
                        <el-switch
                        style="float: right;"
                        @change="changeSwitch(ext)"
                        v-model="ext.enabled"
                        active-color="#13ce66"
                        inactive-color="#ff4949">
                        </el-switch>
                    </div>
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
    import utils from "@/common/util/utils";
    import browser from 'webextension-polyfill'

    export default {
        data() {
            return {
                searchContent: "",
                extensions: [],
                tempExts: [],
            };
        },
        created() {
            this.init();
        },
        methods: {
            async init() {
                const getI18N = chrome.i18n.getMessage;
                const myid = getI18N('@@extension_id');
                let dataE = await utils.asyncWorker(
                    new Promise((resolve) =>
                        chrome.management.getAll(ex => {
                            resolve(toVisitedItem(ex))
                        })
                    )
                );
                function toVisitedItem(items) {
                    return items.filter(({ type, id }) => type === 'extension' && id !== myid)
                        .sort((a, b) => {
                            if (a.enabled === b.enabled) {
                                return a.name.localeCompare(b.name)
                            }
                            return a.enabled < b.enabled ? 1 : -1
                        });
                }

                this.extensions = dataE[1]
                chrome.management.onUninstalled.addListener(deleted => {
                    this.extensions = this.extensions.filter(({ id }) => id != deleted)
                })
                chrome.management.onInstalled.addListener(installed => {
                    this.extensions.unshift(installed)
                })
                this.tempExts = this.extensions

            },
            filterExt(){
                if(!this.searchContent){
                    this.extensions = this.tempExts
                    return 
                }
                this.extensions = this.tempExts.filter((ext)=>{
                    return ext.name.toLowerCase().includes(this.searchContent.toLowerCase())
                })
            },
            clickInfo(ext) {
                browser.tabs.create({ url: `chrome://extensions/?id=${ext.id}` });
            },
            clickDelete(ext) {
                chrome.management.uninstall(ext.id);
            },
            changeSwitch(ext){
                chrome.management.setEnabled(ext.id, ext.enabled);
            },
            getIconUrl(icons,size = 16) {
                size *= window.devicePixelRatio;
                if (icons) {
                    return icons[0].url
                }
                return 'icons/puzzle.svg'
            },

        }

    };
</script>
<style lang="stylus" scoped>

    .el-input /deep/ .el-input__inner {
        border-radius: 20px !important;
    }


    .el-card /deep/ .el-card__body {
        padding: 20px !important;
        height: 110px !important;
    }

    .item-card 
        margin 5px
        /* &:hover 
            cursor:pointer
            background-color rgb(235, 235, 235) */
        

    .htitle {
        font-size: 14px;
        display:flex;
        font-weight: bold;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .icon {
        display: inline-block;
        margin-right: 0.8em;
        width: 1.5em;
        vertical-align: text-bottom;
    }

    .description {
        margin-top: 5px;
        margin-left: 2.05em;
        color: rgb(153, 153, 153);
        height:48px
    }

    .buttonBox {
        width: 100%;
        margin-top: 10px;
        float: right;
        position: relative;
    }
    .button {
        left: 0px;
        position: absolute;
    }
    .search {
        display: flex;
        align-items:center;
        flex-flow: column;
    }
    .searchbar {
        width: 400px;
        display: flex;
        align-items:center;
        position:fixed !important;
        margin-top: 10px !important;
        z-index: 999;
    }

</style>