<template>
  <div class="box">
    <div class="box-content">
      <div class="topic-account">
        <div v-if="page===1" class="c1">
          <div>
            <span>账号: </span>
            <el-input size="mini" v-model="account" placeholder="Email"></el-input>
          </div>
          <div>
            <span>密码: </span>
            <a @click="page=2" class="forget-password">忘记密码</a>
            <el-input size="mini" v-model="password" type="password" placeholder="密码"></el-input>
          </div>
          <div>
            <el-button class="b1" type="primary" size="mini" @click="login()">登录</el-button>
          </div>
          <div>
            <el-button class="b1" size="mini" @click="page=3">注册</el-button>
          </div>
        </div>
        <div v-if="page===2" class="c2">
          <div>
            <span>账号: </span>
            <el-input size="mini" v-model="account" placeholder="Email"></el-input>
          </div>
          <div>
            <el-input size="mini" v-model="code" type="password" placeholder="验证码"></el-input>
          </div>
          <div>
            <el-button class="b1" type="primary" size="mini" @click="forgetPassword()">提交</el-button>
          </div>
          <div>
            <el-button class="b1" size="mini" @click="page=1">已想起密码，回到登录页面</el-button>
          </div>
        </div>
        <div v-if="page===3" class="c3">
          <div>
            <span>账号: </span>
            <el-input size="mini" v-model="create.email" placeholder="Email"></el-input>
          </div>
          <div>
            <span>用户名: </span>
            <el-input size="mini" v-model="create.name" placeholder="用户名"></el-input>
          </div>
          <div>
            <span>密码: </span>
            <el-input size="mini" v-model="create.password" type="password" placeholder="密码"></el-input>
          </div>
          <div>
            <span>再次输入密码: </span>
            <el-input size="mini" v-model="create.password2" type="password" placeholder="密码"></el-input>
          </div>
          <div>
            <el-button class="b1" type="primary" size="mini" @click="register">注册</el-button>
          </div>
          <div>
            <el-button class="b1" size="mini" @click="page=1">登录</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import storage from '@/common/storage'

  // import axios from 'axios'

  const host = 'http://localhost:8080';
  let uid = 'a79bff3da06140e7b9cb5444f628918e';

  export default {
    name: "Account",
    data() {
      return {
        page: 1, /*1: 'login', 2: 'forgetPassword', 3: 'register'*/
        account: "",
        password: '',
        code: '',
        create: {
          email: '',
          name: '',
          password: '',
          password2: '',
        }
      }
    },
    components: {
    },
    methods: {
      login: function () {
        // developing
        storage.set({'account': uid});
        // storage.get('account');
      },
      register: function () {
        console.log("test-register");
        // validate
        if(this.create.password !== this.create.password2){
          return false
        }

        let url = '/account/register';
        let options = {
          email: this.create.email,
          username: this.create.name,
          password: this.create.password
        };
        /*axios.get(host + url, {params:options})
          .then((response) => {
            if(response.data == false){
              console.log("注册失败");
            }else {
              console.log("注册成功，请用Email登录");
            }
          })
          .catch((error) => {
            console.log(error);
          });*/
      },
      forgetPassword: function () {

      }
    }
  }
</script>

<style lang="stylus" scoped>
  .box
    display grid
    grid-template-rows 40px auto
    grid-template-areas "header" "content"
    .box-header
      grid-area header
    .box-content
      grid-area content

  .topic-account
    padding calc(20% - 125px) calc(50% - 125px)

  .c1,
  .c2,
  .c3
    width 250px
    & > div
      margin-bottom 15px
    & > div > div
      margin-top 5px

  .forget-password
    //警告：两者间隔170px，可能会因为文字更改布局变形，比如国际化后文字的宽度不同导致布局变形
    margin-left 170px
    color: #009a61;
    &:link
      text-decoration: none;
      cursor: default;
    &:visited
      text-decoration: none;
      cursor: default;
    &:active
      text-decoration: none;
      cursor: default;
    &:hover
      color: #004e31;
      text-decoration: underline;
      cursor: default;

  .b1
    width 250px
</style>
