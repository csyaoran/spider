import "./js/init.js"

import * as utils from "./js/utils.js"
import * as config from "./js/config.js"

// 标签更新，清除该标签之前记录
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  if(changeInfo.status === "loading") { // 在载入之前清除之前记录
    chrome.storage.local.get(['xMediaUrls'], function(data) {
      // tabId 标签更新后，清空其附属资源列表
      if(data.xMediaUrls[tabId]) {
        data.xMediaUrls[tabId] = [];
        chrome.storage.local.set({"xMediaUrls": data.xMediaUrls});
      }
    });
  }
});

// 标签关闭，清除该标签之前记录
chrome.tabs.onRemoved.addListener(function(tabId) {
  chrome.storage.local.get(['xMediaUrls'], function(data) {
    // tabId 标签关闭后，删除其附属资源列表
    if(data.xMediaUrls[tabId]) {
      delete data.xMediaUrls[tabId];
      chrome.storage.local.set({"xMediaUrls": data.xMediaUrls});
    }
  });
});

// 资源嗅探页面ID
let xFinderPageIds = [];
// 创建嗅探页面
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    //console.log(info); // [资源嗅探]菜单信息
    //console.log(tab); // 当前网页TAB信息

    if(utils.skipChromeStuff(tab.url)) {
      console.log("当前界面: " + tab.url + ", 不创建[资源嗅探]页面！");
      return; // 不再新建 xfinder.html 页面
    }

    // 创建资源嗅探TAB页面
    chrome.tabs.create({
      url: "xfinder.html",
      selected: true
    }, function(xFinderPage) {
      //console.log(xFinderPage);
      xFinderPageIds.push({tid: xFinderPage.id, url: tab.url});

      // 监听TAB页面，关闭时删除其对应ID
      // tabId 页面整数ID, removeInfo 关闭的TAB页面Object信息
      chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
        //console.log(removeInfo);
        //console.log('关闭TAB页面, id=' + tabId);
        for(let idx=0; idx<xFinderPageIds.length; idx++) {
          if(xFinderPageIds[idx].tid === tabId) {
            xFinderPageIds.splice(idx, 1);
            break;
          }
        }
      });
    });
    // 刷新当前页面
    chrome.tabs.reload(tab.id);
  }
);

// 检测媒体文件地址大小等信息
chrome.webRequest.onResponseStarted.addListener(
  function(data) { findMedia(data); },
  {urls: ["http://*/*", "https://*/*"]},
  ["responseHeaders"]
);

// 开始判断
function findMedia(data) {
  if(data.tabId == -1) {
    utils.consoleLog("Not Tab ID", data);
    return;
  }

  if(utils.skipChromeStuff(data.url)) {
    // SKIP FOR chrome://*
    // SKIP FOR chrome-extension://*
    return;
  }

  let title = ''; // 网页标题
  let name = utils.getFileName(data.url); // 获得文件名
  let ext = utils.getExt(name); // 获得扩展名
  let size = utils.getHeaderValue("content-length", data); // 获得文件大小
  let contentType = utils.getHeaderValue("content-type", data);

  chrome.tabs.get(data.tabId, function(info) {
    if(typeof(info) === "object") {
      title = info.title; // 获得标题
    }
  });

  //console.log(" Normal", data);
  let isTsbCache = false;
  if(data.fromCache) {
    let xre= new RegExp("^http://m\.tingshubao\.com/book/[0-9]+\.html$");
    if(xre.test(data.url)) {
      isTsbCache = true;
    }
  }

  if(data.initiator === config.webId.tsb || isTsbCache) {
    if(data.type === "main_frame") {
      utils.consoleLog("听书宝 Book 列表", data);

      // 检测当前页面是否是听书宝 BOOK 列表页面
      //
      // 匹配 URL 示例
      // http://m.tingshubao.com/book/26.html
      //
      // JS 正则表达式
      // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions
      let xre= new RegExp("^http://m\.tingshubao\.com/book/[0-9]+\.html$");
      if(!xre.test(data.url)) {
        utils.consoleLog("SKIP 听书宝非有声书列表");
        return; // 检测失败
      }

      // 找到听书宝关联的"资源嗅探"页面ID
      let tsbRtpId = -1;
      for(let idx=0; idx<xFinderPageIds.length; idx++) {
        let tmp = xFinderPageIds[idx].url.split("/");
        if(tmp.length >= 3 && tmp[1] == "") {
          tmp = tmp[0] + "//" + tmp[2];
        }

        if(tmp === config.webId.tsb) {
          tsbRtpId = xFinderPageIds[idx].tid;
          break;
        }
      }

      if(tsbRtpId == -1) {
        return;
      }

      // chrome.tabs.sendMessage(arg1, arg2, arg3)
      // - arg1 TAB页面ID
      // - arg2 发送的数据对象
      chrome.tabs.sendMessage(tsbRtpId, { // 发送给 xfinder.js
        xid: config.webId.tsb,
        url: decodeURIComponent(data.url)
      }, function(response) { /* Nothing */});
    }
  }

  let filter = false; // 过滤器开关

  // 判断后缀名及文件大小
  if(!ext) {
    return;
  } else if(config.extTable.exts[ext] >= 0) { // 扩展名匹配
    if(config.extTable.exts[ext] == 0 || size >= config.extTable.exts[ext]*1024 || size == null) {
      filter = true; // 文件大小匹配
    } else {
      return; // 大小不符合条件，跳过
    }
  }

  // 判断MIME类型
  if(contentType != null && !filter) {
    for(let i = 0; i < config.mimeType.data.length; i++) {
      if(!utils.wildcard(config.mimeType.data[i], contentType)) {
        continue;
      } else {
        filter = true;
        break;
      }
    }
  }

  // 查找附件
  let contentDisposition = utils.getHeaderValue('Content-Disposition', data);
  if(contentDisposition) {
    let res = contentDisposition.match(/filename="(.*?)"/);
    if(res && res[1]) {
      name = decodeURIComponent(res[1]); // 编码
      name = utils.getFileName(name);
      ext = utils.getExt(name);
      if(config.extTable.exts[ext] >= 0) { // 扩展名匹配
        filter = true;
      }
    }
  }

  if(filter) {
    let url = data.url;
    let dealUrl = url;

    // 去除参数
    let ignArgsReg = {};
    chrome.storage.local.get(['xIgnArgsReg'], function(data) {
      Object.assign(ignArgsReg, {data: data.xIgnArgsReg});
    });
    let ignUrlArgs = new RegExp(ignArgsReg.data, 'g');
    chrome.storage.local.get(['xIgnArgs'], function(data) {
      if(data.xIgnArgs) {
        dealUrl = dealUrl.replace(ignUrlArgs, "");
      }
    });

    let mediaUrls = {};
    chrome.storage.local.get(['xMediaUrls'], function(data) {
      Object.assign(mediaUrls, data.xMediaUrls);
    });

    if(mediaUrls[data.tabId] === undefined) {
      mediaUrls[data.tabId] = [];
    }

    for(let j = 0; j<mediaUrls[data.tabId].length; j++) {
      let existUrl = mediaUrls[data.tabId][j].url;
      // 去除参数
      chrome.storage.local.get(['xIgnArgs'], function(data) {
        if(data.xIgnArgs) {
          existUrl = existUrl.replace(ignUrlArgs,"");
        }
      });

      if(existUrl === dealUrl)
        return; // 不重复记录
    }

    size = Math.round( 100 * size / 1024 / 1024 ) / 100 +"MB";
    let info = {
      tabid: data.tabId,
      type: contentType,
      title: decodeURIComponent(title),
      name: decodeURIComponent(name),
      size: size,
      ext: ext,
      url: url
    };

    mediaUrls[data.tabId].push(info);
    chrome.storage.local.set({"xMediaUrls": mediaUrls});

    utils.consoleLog("Media Data", data);
    utils.consoleLog("Media Info", info);
    utils.consoleLog("Media List", mediaUrls);

    // 数字提示
    chrome.action.setBadgeText({
      tabId: data.tabId,
      text: mediaUrls[data.tabId].length.toString()
    });
    // 鼠标悬停文字提示
    chrome.action.setTitle({
      tabId: data.tabId,
      title: "抓到 " + mediaUrls[data.tabId].length.toString() + " 个媒体资源"
    });
  }
}