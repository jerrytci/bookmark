<p align="center">
  <img src="./src/assets/icons/icon_128.png">
</p>
<h1 align="center">Bookmark</h1>

[ENGLISH README](README.en.md)

处理Chrome\"其他文件夹\"的书签。有存储\"临时\"书签，分类保存书签，快捷键操作，自定义设置，快捷查看书签，高效管理书签等功能。

### 功能

##### 主页（展示）

![](README.assets/SHOW_BLACK_HAVE_CHROME_TITLE.png)

[想要更多功能？在这里告诉我吧](https://github.com/rejerry/bookmark/issues/new)

### 使用教程

##### 主页（显示列表）

- 插件显示chrome书签栏的“其他文件夹”的书签
- 主体：1（左边，黑色背景）显示“BPF”文件夹内的书签，采用单列滚动排列；2 (右边) 显示除了第一个BPF文件夹外的所有书签，采用瀑布布局
- 设计：1 左边 - 用于存储“临时”书签，类比onetab(如果不知道，请搜索一下)；这部分书签是用于存储临时书签，但书签同步到你的google账户的。2 右边 - 可以将“临时”书签保存到此

##### 操作

- 快捷键
- 设置
- 右键菜单
- 点击icon默认操作
- icon右键菜单

##### 7种操作

- 显示列表
- 储存左边的标签
- 储存右边的标签
- 储存选中的标签
- 储存未选中的标签
- 储存所有标签
- 储存所有窗口的所有标签

##### 注意

- 请保持有且仅有一个叫“BPF”的文件夹，并且放到“其他文件夹“的第一层的下面”；
- 默认不显示空文件夹

### 安装

[Bookmark - Chrome 网上应用店](https://chrome.google.com/webstore/detail/bookmark/paigdnkkmodopofccgdeacgoocgeijkn/related?hl=zh-CN&gl=US)

### 开发

从源码中编译：
0. Clone 这个仓库
0. 安装依赖 (使用 `yarn` 命令)
0. 自动重新加载 (使用 `yarn dev` 命令)
0. 点击 `加载已解压的扩展程序` 按钮并选择 `./dist` 目录
0. 编译并打包 (使用 `yarn build` 命令)

### 许可

GPL3.0

### 关于作者

jerry · [rejerry(github)](https://github.com/rejerry)

### 最后

谢谢你的观看；欢迎安装使用，讨论bug，讨论功能三连。欢迎在插件下面评价

感谢 [cnwangjie/better-onetab: A better OneTab for Chrome & Firefox](https://github.com/cnwangjie/better-onetab)