import * as utils from "./utils.js"
import * as config from "./config.js"

import * as tsb from "./xfinder/tsb.js";

$('#tsb').hide();
$('#xmly').hide();

// 接收 service-worker.js 发送的消息
//
// - data  表示 chrome.tabs.sendMessage() 的第2个参数，即数据对象
// - cbf   表示 chrome.tabs.sendMessage() 的第3个参数，即回调函数
chrome.runtime.onMessage.addListener(function(data, _, cbf) {
  if(data.xid === config.webId.tsb) {
    function bookInfo(info) {
      if(info) {
        info.baseUrl = data.xid;
      }
      console.log(info);
    }
    tsb.mediaParse(data.url, bookInfo);
    $('#tsb').show();
  }
  if(data.xid === config.webId.xmly) {
    $('#xmly').show();
  }
  cbf("ok");
});