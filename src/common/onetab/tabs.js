import storage from './storage'
import list from '../util/list'
import utils from '../util/utils'
import _ from 'lodash'
import browser from 'webextension-polyfill'

const pickedTabAttrs = ['url', 'title'];

/*1 get tab*/
const getSelectedTabs = () => browser.tabs.query({highlighted: true, currentWindow: true});

const getAllInWindow = windowId => browser.tabs.query({windowId});

const getAllTabsInCurrentWindow = async () => {
  const currentWindow = await browser.windows.getCurrent();
  return getAllInWindow(currentWindow.id)
};

const groupTabsInCurrentWindow = async () => {
  const tabs = await getAllTabsInCurrentWindow();
  const result = {left: [], right: []};
  let currentIsRight = false;
  for (const tab of tabs) {
    if (tab.highlighted) {
      currentIsRight = true
    } else if (currentIsRight) result.right.push(tab);
    else result.left.push(tab)
  }
  result.twoSide = result.left.concat(result.right);
  return result
};

/*2 open tab list*/
const openTab = async tab => browser.tabs.create({url: tab.url});


/*如果存在多个index.html#/app 地址下的page,切换到latest page,其他关闭；如果没有则新建一个*/
const openTabLists = async () => {
  const currentWindow = await browser.windows.getCurrent();
  const windowId = currentWindow.id;
  const tabs = await getAllInWindow(windowId);
  let tabsRes = tabs.filter(i =>
    browser.runtime.getURL('index.html#/view/') === i.url
    || browser.runtime.getURL('index.html#/view') === i.url
  );
  if (tabsRes.length === 0) {
    await browser.tabs.create({url: browser.runtime.getURL('index.html#/view/')})
  } else {
    let latestTab = tabsRes.splice(tabsRes.length - 1, 1);
    const tabIndex = tabs.findIndex(tab => tab.id === latestTab[0].id);
    browser.tabs.highlight({windowId, tabs: tabIndex});

    /*关闭其他tab*/
    if (tabsRes.length !== 0) {
      let ids = [];
      tabsRes.map(i => ids.push(i.id));
      browser.tabs.remove(ids);
    }
  }
};

const openOptionsPage = async () => {
  window.open(browser.runtime.getURL('index.html#/view/options'))
};

/*3 store*/
/*create folder and bookmark*/
const createFolder = (parentID, newList) => {
  chrome.bookmarks.create({
      parentId: parentID,
      title: newList.title === "" ? utils.formatTimeForTitle(new Date()) : newList.title
    },
    (BookmarkTreeNode) => {
      newList.tabs.forEach((value) => {
        chrome.bookmarks.create({parentId: BookmarkTreeNode.id, title: value.title, url: value.url});
      });
    });
};

const storeTabs = async tabs => {
  /*过滤appUrl 的tab*/
  const appUrl = browser.runtime.getURL('');
  tabs = tabs.filter(i => !i.url.startsWith(appUrl));

  /*是否忽略pinned*/
  const opts = await storage.getOptions();
  if (opts.ignorePinned) tabs = tabs.filter(i => !i.pinned);
  if (tabs.length === 0) return;

  /*根据tab.id关闭tab*/
  browser.tabs.remove(tabs.map(i => i.id));

  const newList = list.createNewTabList({tabs: pickTabs(tabs)});

  /*get chrome bookmark pro folder BPF*/
  let unSortFolder = "BPF";
  chrome.bookmarks.getChildren("2", function (nodesRes) {
    let nodes = nodesRes.filter(i => i.title === unSortFolder);
    if (nodes.length === 0) {
      console.log('请保持一个名字为"' + unSortFolder + '"的文件夹; 随后会为你自动创建一个"' + unSortFolder + '"文件夹');
      chrome.bookmarks.create({parentId: "2", title: unSortFolder}, (BookmarkTreeNode) => {
        createFolder(BookmarkTreeNode.id, newList);
      });
    } else if (nodes.length === 1) {
      createFolder(nodes[0].id, newList);
    } else {
      console.log('请保持一个名字为"' + unSortFolder + '"的文件夹; 存在多个"' + unSortFolder + '"文件夹,新创建的文件夹将会保存到最早创建的"' + unSortFolder + '"文件夹中;');
      createFolder(nodes[0].id, newList);
    }
  });

  if (opts.addHistory) {
    for (let i = 0; i < tabs.length; i += 1) {
      await browser.history.addUrl({url: tabs[i].url})
    }
  }
};

const storeSelectedTabs = async () => {
  const tabs = await getSelectedTabs();
  const allTabs = await getAllTabsInCurrentWindow();
  if (tabs.length === allTabs.length) await openTabLists();
  return storeTabs(tabs)
};

const storeLeftTabs = async () => storeTabs((await groupTabsInCurrentWindow()).left);
const storeRightTabs = async () => storeTabs((await groupTabsInCurrentWindow()).right);
const storeTwoSideTabs = async () => storeTabs((await groupTabsInCurrentWindow()).twoSide);

const storeAllTabs = async () => {
  const tabs = await getAllTabsInCurrentWindow();
  await openTabLists();
  return storeTabs(tabs)
};

const storeAllTabInAllWindows = async () => {
  const windows = await browser.windows.getAll();
  await openTabLists();
  for (const window of windows) {
    const tabs = await getAllInWindow(window.id);
    storeTabs(tabs)
  }
};

/*4 restore */
const restoreList = async (list, windowId) => {
  for (let i = 0; i < list.tabs.length; i += 1) {
    const tab = list.tabs[i];
    const createdTab = await browser.tabs.create({
      url: tab.url,
      pinned: tab.pinned,
      index: i,
      windowId,
    });
    if (tab.muted) browser.tabs.update(createdTab.id, {muted: true})
  }
};

const restoreListInNewWindow = async list => {
  const createdWindow = await browser.windows.create({url: list.tabs.map(i => i.url)});
  list.tabs.map((tab, index) => {
    if (tab.muted) browser.tabs.update(createdWindow.tabs[index].id, {muted: true})
  })
};

const viewFolder = async (folder, windowId) => {
  for (let i = 0; i < folder.children.length; i += 1) {
    const tab = folder.children[i];
    const createdTab = await browser.tabs.create({
      url: tab.url,
      index: i,
      windowId,
    });
  }
};
const viewFolderInNewWindow = async folder => {
  const createdWindow = await browser.windows.create({url: folder.children.map(i => i.url)});
  folder.children.map((tab, index) => {
    if (tab.muted) browser.tabs.update(createdWindow.tabs[index].id, {muted: true})
  })
};


const historyTabs = async () => {

  await browser.browserAction.setPopup({popup: 'index.html#/history'})
  
  // return res.data;
}



/*5 other*/
/*根据Attrs挑选符合的tab; 设置是否静音;*/
const pickTabs = tabs => tabs.map(tab => {
  const pickedTab = _.pick(tab, pickedTabAttrs);
  pickedTab.muted = tab.mutedInfo && tab.mutedInfo.muted;
  return pickedTab
});

export default {
  groupTabsInCurrentWindow,
  getSelectedTabs,

  openTabLists,
  openTab,
  openTheFirstSidePage: openOptionsPage,

  storeSelectedTabs,
  storeLeftTabs,
  storeRightTabs,
  storeTwoSideTabs,
  storeAllTabs,
  storeAllTabInAllWindows,

  restoreList,
  restoreListInNewWindow,

  viewFolder,
  viewFolderInNewWindow,

  historyTabs,
}
