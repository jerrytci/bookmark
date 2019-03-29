<template>
  <div class="box">
    <el-row class="box-content">
      <el-col :span="14" :offset="5" class="setting">
        <el-card class="box-card" v-for="(optionsList, cate) in optionsLists" :key="cate">
          <div slot="header" class="clearfix">
            <span>{{ __('ui_options_' + cate) }}</span>
          </div>
          <div v-for="option in optionsList">
            <el-row :gutter="20" class="options">
              <el-col :span="16">
                <span>{{ option.desc }}</span>
                <strong v-if="option.name === 'syncList' && quotaExceeded"
                        :style="{color: 'red', paddingLeft: '8px'}">quota exceeded!</strong>
              </el-col>
              <el-col :span="8">
                <el-select v-if="option.type === String"
                           v-model="options[option.name]"
                           @change="optionsChanged(option.name, $event)"
                           class="select-amend"
                           placeholder="请选择">
                  <el-option
                          v-for="item in option.items"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                  </el-option>
                </el-select>

                <el-switch v-if="option.type === Boolean"
                           v-model="options[option.name]"
                           @change="optionsChanged(option.name, $event)"
                           class="switch-amend"
                           active-color="#13ce66"
                           inactive-color="#ff4949">
                </el-switch>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>
  import storage from '@/common/onetab/storage'
  import options from '@/common/util/options'
  import __ from '@/common/util/i18n'
  import _ from 'lodash'

  export default {
    data() {
      return {
        optionsLists: _.groupBy(options.optionsList, 'cate'),
        options: {},
        snackbar: false,
        quotaExceeded: false,
      }
    },
    created() {
      this.init()
    },
    methods: {
      __,
      optionsChanged: _.debounce(async function (key, value) {
        console.log(key, value);
        // when type of option is string options can not be set correctly after first storage.setOptions() called
        await storage.setOptions(this.options);
        await storage.setOptions(this.options);
        chrome.runtime.sendMessage({optionsChanged: {[key]: value}})
      }, 100),
      async init() {
        const opts = await storage.getOptions();
        Object.keys(opts).map(key => {
          this.$set(this.options, key, opts[key])
        });
        chrome.runtime.onMessage.addListener(msg => {
          if (msg.optionsChangeHandledStatus === 'success') {
            this.snackbar = true
          }
        });
        this.quotaExceeded = storage.isQuotaExceeded()
      }
    }
  }
</script>
<style lang="stylus" scoped>
  .setting {
    padding-top: 50px;
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
