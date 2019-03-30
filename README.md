<p align="center">
  <img src="./src/assets/icons/icon_128.png">
</p>
<h1 align="center">Bookmark</h1>

安装地址：[Bookmark - Chrome 网上应用店](https://chrome.google.com/webstore/detail/bookmark/paigdnkkmodopofccgdeacgoocgeijkn/related?hl=zh-CN&gl=US)

---

[ENGLISH README](README.en.md)

处理Chrome\"其他文件夹\"的书签。有存储\"临时\"书签，分类保存书签，快捷键操作，自定义设置，快捷查看书签，高效管理书签等功能。

### 教程

#### 主页

![](README.assets/SHOW_BLACK_HAVE_CHROME_TITLE.png)

[教程讨论（Tutorial discussion） · Issue #1 · rejerry/bookmark](https://github.com/rejerry/bookmark/issues/1)

[我已看过教程讨论；想要更多功能或者提交BUG？在这里告诉我吧](https://github.com/rejerry/bookmark/issues/new)

#### 功能

- “临时”书签
- 瀑布流书签
- 拖拽
- 快捷键
- 设置
- 图标（Icon）右键菜单
- 右键菜单（页面上下文菜单）

#### 7种操作

- 显示列表
- 储存左边的标签
- 储存右边的标签
- 储存选中的标签
- 储存未选中的标签
- 储存所有标签
- 储存所有窗口的所有标签

### 问与答

###### bookmark是什么?

处理书签栏溢出的书签。处理Chrome\"其他文件夹\"的书签。

###### 最佳实践

- “临时”书签：（主页左部，黑色背景）用来存储临时书签，类比onetab；但不同于onetab，"bookmark"的“临时”书签上的书签是保存到chrome，和其他书签无异。使用完后可以删除或者保存到 “瀑布流书签”。
- 瀑布流书签：（主页右部）采用瀑布流布局。可修改文件夹内容；拖拽合并文件夹。大规模变动推荐在书签管理器进行修改，效率更高。
- 文件夹书签数量：没有限制；推荐不要太多，不超过20个。

###### 什么是“BPF”文件夹

“BPF”文件夹时设定来存放“临时”书签。

如果存在多个，只会显示一个；请保持有且仅有一个“BPF”的文件夹；推荐放到“其他文件夹“的第一层的下面，并置顶”。

###### ”瀑布流书签“为什么没有文件夹视图

瀑布流书签才用瀑布流设计，4栏，每栏可以容纳35+条书签。单页面可以容纳150+条书签。6页可以容纳近1k条书签

###### 同步

bookmark只是帮助管理和查看chrome “其他书签” ，数据同步由google提供。

###### 兼容

只在chrome开发和测试。但是理论支持其他可以安装chrome插件的浏览器。[兼容讨论（Compatible discussion） · Issue #2 · rejerry/bookmark](https://github.com/rejerry/bookmark/issues/2)

###### 其他

默认不显示空文件夹

支持中英文

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

### 感谢

部分参考 [cnwangjie/better-onetab: A better OneTab for Chrome & Firefox](https://github.com/cnwangjie/better-onetab) ，表示感谢！

### 作者

jerry · [rejerry(github)](https://github.com/rejerry)

### 最后

谢谢你的观看！欢迎安装使用（[Bookmark - Chrome 网上应用店](https://chrome.google.com/webstore/detail/bookmark/paigdnkkmodopofccgdeacgoocgeijkn/related?hl=zh-CN&gl=US)），讨论bug，讨论功能三连。欢迎在插件下面评价，Star项目
