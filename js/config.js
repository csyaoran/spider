// 音频网址 IDs
export const webId = {
  "tsb": "http://m.tingshubao.com", // 听书宝
  "xmly": "https://www.ximalaya.com" // 喜马拉雅
};

// xIgnArgs
// xIgnArgsReg
// xUseTitleName

function isDebugMode(debug) {
  if(debug) {
    console.log("** 蜘蛛 | 调试模式 **");
  } else {
    console.log("** 蜘蛛 | 用户模式 **");
  }
}

const mode = {debug: false};
chrome.storage.local.get(['xDebug'], function(data) {
  isDebugMode(data.xDebug);
  Object.assign(mode, {debug: data.xDebug});
});

export function debugMsg(label="", msg="") {
  if(!mode.debug) {
    return;
  }
  // 参考 https://stackoverflow.com/a/27074218/470749
  let err = new Error();
  let stack = err.stack.toString().split(/\r\n|\n/);

  let infomsg = "";
  let xprefix = "=>";
  for(let i=2; i<stack.length; i++) {
    if(infomsg === "") {
      infomsg = xprefix + stack[i].replace(/^\s*|\s*$/g,"");
    } else {
      infomsg = infomsg + "\n" + xprefix + stack[i].replace(/^\s*|\s*$/g,"");
    }
    xprefix = "  " + xprefix;
  }

  if(label === '') {
    label = '???';
  }
  console.log("-------- " + label + " --------");
  if(msg) console.log(msg);
  console.log(infomsg);
}

// 构建快速查找扩展名表格
export const extTable = {exts: {}, length: 0};
chrome.storage.local.get(['xExt'], function(data) {
  let tmp = {exts: {}, length: 0};
  tmp.length = data.xExt.length;
  for(let i = 0; i < data.xExt.length; i++) {
    tmp.exts[data.xExt[i].ext] = data.xExt[i].size;
  }
  Object.assign(extTable, tmp);
});

// 构建快速查找 MIME-Type 表格
export const mimeType = {data: []};
chrome.storage.local.get(['xMimeType'], function(data) {
  let tmp = {data: []};
  for(let i = 0; i < data.xMimeType.length; i++) {
    tmp.data.push(data.xMimeType[i].Type.toLowerCase());
  }
  Object.assign(mimeType, tmp);
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  for(let [key, { oldValue, newValue }] of Object.entries(changes)) {
    //console.log(`Key "${key}" in namespace "${namespace}" changed.`);
    //console.log(`Old value "${oldValue}", new value "${newValue}".`);
    if(key === "xDebug") {
      isDebugMode(data.xDebug);
      Object.assign(mode, {debug: data.xDebug});
    } else if(key === "xExt") {
      if(mode.debug) {
        console.log("媒体资源嗅探类型:", newValue);
      }
      let tmp = {exts: {}, length: 0};
      tmp.length = data.xExt.length;
      for(let i = 0; i < data.xExt.length; i++) {
        tmp.exts[data.xExt[i].ext] = data.xExt[i].size;
      }
      Object.assign(extTable, tmp);
    } else if(key === "xMimeType") {
      if(mode.debug) {
        console.log("MIME类型匹配类型:", newValue);
      }
      let tmp = {data: []};
      for(let i = 0; i < data.xMimeType.length; i++) {
        tmp.data.push(data.xMimeType[i].Type.toLowerCase());
      }
      Object.assign(mimeType, tmp);
    } else if(key === "xIgnArgs") {
      if(mode.debug) {
        console.log("删除媒体资源自带参数:", newValue);
      }
    } else if(key === "xIgnArgsReg") {
      if(mode.debug) {
        console.log("删除媒体资源自带参数正则表达式:", newValue);
      }
    } else if(key === "xUseTitleName") {
      if(mode.debug) {
        console.log("下载时使用网页标题做文件名:", newValue);
      }
    }
  }
});