// 调试开关
chrome.storage.local.set({"xDebug": true});

// 音视频扩展名
chrome.storage.local.set({"xExt": [
  // 音频
  {"ext": "mp3", "size":0}, // 有损压缩数字音频格式
  {"ext": "wma", "size":0}, // 微软 Windows Media Audio
  {"ext": "wav", "size":0}, // WIN 平台的音频信息资源
  {"ext": "ogg", "size":0}, // 开源音频有损压缩，类似 MP3
  {"ext": "m4a", "size":0}, // MPEG-4 音频标准的文件的扩展名
  {"ext": "acc", "size":0}, // Advanced Audio Coding,专为声音数据设计的文件压缩格式
  // 视频
  {"ext": "mp4", "size":0}, // 有损压缩数字视频格式
  {"ext": "ogv", "size":0}, // 开源视频有损压缩，类似 MP4
  {"ext": "flv", "size":0}, // Flash Video，文件小加载快
  {"ext": "hlv", "size":0}, // 类似 FLV格式
  {"ext": "f4v", "size":0}, // 类似 FLV格式
  {"ext": "m4s", "size":0}, // HTML5播放格式
  {"ext": "m3u8","size":0}, // 苹果推出的视频播放标准
  // 多媒体
  {"ext": "letv","size":0}, // 乐视多媒体文件
  {"ext": "webm","size":0}, // Google推出的多媒体文件
  {"ext": "ts",  "size":0}, // 高清音频/视频封装格式
  {"ext": "mov", "size":0}, // 音频、视频文件封装格式
  {"ext": "mkv", "size":0}  // 开放标准的容器，音频、视频文件封装格式
]});

// MIME Type
chrome.storage.local.set({"xMimeType": [
  {"Type":"video/*"},
  {"Type":"audio/*"}
]});

// 去除URL重复参数
chrome.storage.local.set({"xIgnArgs": false});

// 去除URL重复参数正则表达式
chrome.storage.local.set({"xIgnArgsReg": "\\?[\\S]+"});

// 文件名 = 网页标题 + 扩展名
chrome.storage.local.set({"xUseTitleName": false});

function isDebugMode(debug) {
  if(debug) {
    console.log("** 蜘蛛 | 调试模式 **");
  } else {
    console.log("** 蜘蛛 | 用户模式 **");
  }
}

chrome.storage.local.get(['xDebug'], function(data) {
  isDebugMode(data.xDebug);
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  for(let [key, { oldValue, newValue }] of Object.entries(changes)) {
    //console.log(`Key "${key}" in namespace "${namespace}" changed.`);
    //console.log(`Old value "${oldValue}", new value "${newValue}".`);
    if(key === "xDebug") {
      isDebugMode(newValue);
    }
    if(key === "xExt") {
      console.log("媒体资源嗅探类型:", newValue);
    }
    if(key === "xMimeType") {
      console.log("MIME类型匹配类型:", newValue);
    }
    if(key === "xIgnArgs") {
      console.log("删除媒体资源自带参数:", newValue);
    }
    if(key === "xIgnArgsReg") {
      console.log("删除媒体资源自带参数正则表达式:", newValue);
    }
    if(key === "xUseTitleName") {
      console.log("下载时使用网页标题做文件名:", newValue);
    }
  }
});

chrome.storage.local.set({"xMediaUrls": {}});

// 音频网址 IDs
chrome.storage.local.set({"xAppIds": {
  "tsb": "http://m.tingshubao.com", // 听书宝
  "xmly": "https://www.ximalaya.com" // 喜马拉雅
}});

chrome.runtime.onInstalled.addListener(() => {
  // 注册右键菜单
  chrome.contextMenus.create({
    id: 'IdResFinder',
    title: '资源嗅探',
    contexts: ['page']
  });
});