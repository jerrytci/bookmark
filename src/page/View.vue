<template>
  <el-container style="height: 500px; border: 1px solid #eee" class="view">
    <el-header style="font-size: 12px">
      <div @click="switchMenu" class="el-icon-s-operation menubt"></div>
    </el-header>
    <el-container>
      <el-menu
        :collapse="isCollapse"
        :unique-opened="uniqueOpened"
        :router="true"
        :default-active="$route.path"  
        class="el-menu-vertical"
        mode="vertical"
      >
        <el-menu-item index="/view/home">
          <i class="el-icon-s-platform"></i>
          <span slot="title">首页</span>
        </el-menu-item>
        <el-menu-item index="/view/index">
          <i class="el-icon-s-management"></i>
          <span slot="title">书签</span>
        </el-menu-item>
        <el-menu-item index="/view/extension">
          <i class="el-icon-menu"></i>
          <span slot="title">扩展</span>
        </el-menu-item>
        <el-menu-item index="/view/options">
          <i class="el-icon-s-tools"></i>
          <span slot="title">设置</span>
        </el-menu-item>
        <el-menu-item index="/view/about">
          <i class="el-icon-info"></i>
          <span slot="title">关于</span>
        </el-menu-item>
      </el-menu>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
    <!-- <el-footer>
      <span>
        Made with <i class="fa fa-heart throb" style="color:#d43f57"></i> by
        <a
          style="color:black; text-decoration: none;"
          href="https://www.cnwangjie.com/"
          target="_blank"
          >WangJie</a
        >
      </span>
    </el-footer> -->
  </el-container>
</template>

<style lang="stylus" scoped>

.view {
  height: 100% !important;
}

.el-header {
  background-color: #f5f7fa;
  color: #333;
  line-height: 30px;
  height: 30px !important;
  display:flex;
  display: -webkit-flex;
  /* 对齐排列居中 */
  justify-content:center;
  /* 排列方向垂直 */
  flex-direction:column;
}

.el-container {
  height: calc(100vh - 30px);
}

.el-aside {
  color: #333;
}

.el-main {
  padding: 0;
  flex-basis: 0; /*属性用于设置或检索弹性盒伸缩基准值，左边是menu，不做判断 */
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}

.menubt {
  margin-right: 5px;
  vertical-align: middle;
  width: 24px;
  text-align: center;
  font-size: 18px;
  &:hover {
      cursor:pointer
      background-color rgb(235, 235, 235)
  }
}
</style>

<script>
import storage from "@/common/onetab/storage";

export default {
  data() {
    return {
      isCollapse: true,
      uniqueOpened: true,
      input: "",
    };
  },
  created() {
    this.init();
  },
  methods: {
    async init() {
      let data = await storage.getUOptions('switchMenu')
      console.log(data)
      this.isCollapse = data.switchMenu
    },
    async switchMenu() {
      this.isCollapse = !this.isCollapse;
      console.log(this.isCollapse)
      await storage.setUOptions({switchMenu:this.isCollapse})
    },
  },
};
</script>
