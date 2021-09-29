<template>
    <el-row class="box-content">
        <el-col :span="18" :offset="3" class="setting">
            <el-card class="box-card">
                <div slot="header" class="headerfix">
                    <el-image src="/assets/icons/icon_48.png"></el-image>
                    <div style="display: flex;flex-direction: column;margin-left: 4px;justify-content: center;">
                        <span>{{ __('ext_name') }}</span>
                        <span>Version: {{ version }}</span>
                    </div>
                </div>
                <span>{{ __('ext_desc') }}</span>
                <div style="margin-top: 3px;">{{ __('ext_introduce') }}</div>
                <el-divider></el-divider>
                <el-link type="primary" href="https://github.com/rejerry/bookmark" target="_blank">点击查看使用说明</el-link>
            </el-card>
        </el-col>
    </el-row>
</template>

<script>
    import __ from "@/common/util/i18n";
    export default {
        data() {
            return {
                version: '',
            };
        },
        created() {
            this.init();
        },
        methods: {
            __,
            async init() {
                const manifest = chrome.runtime.getManifest()
                this.version = manifest.version
            },
        }
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

    .headerfix {
        display: flex;
    }
</style>