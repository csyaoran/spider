export const webId = {};
chrome.storage.local.get(['xAppIds'], function(data) {
  Object.assign(webId, data.xAppIds);
});

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