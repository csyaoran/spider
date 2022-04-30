import * as utils from "../utils.js"
import * as config from "../config.js"

import * as tsb from "./tsb.js";

$('#tsb').hide();
$('#xmly').hide();
$('#ysts8').hide();
$('#showBook').hide();
$('#showNote').show();

function showNote() {
  $('#tsb').hide();
  $('#xmly').hide();
  $('#ysts8').hide();
  $('#showBook').hide();
  $('#showNote').show();
}
function tsbShow(info) {
  if(!info.ok) {
    showNote();
    return;
  }
  $('#tsb').show();
  $('#xmly').hide();
  $('#ysts8').hide();
  $('#showBook').show();
  $('#showNote').hide();
}
function xmlyShow(info) {
  if(!info.ok) {
    showNote();
    return;
  }
  $('#tsb').hide();
  $('#xmly').show();
  $('#ysts8').hide();
  $('#showBook').show();
  $('#showNote').hide();
}
function ysts8Show(info) {
  if(!info.ok) {
    showNote();
    return;
  }
  $('#tsb').hide();
  $('#xmly').hide();
  $('#ysts8').show();
  $('#showBook').show();
  $('#showNote').hide();
}

// 接收 service-worker.js 发送的消息
//
// - data  表示 chrome.tabs.sendMessage() 的第2个参数，即数据对象
// - cbf   表示 chrome.tabs.sendMessage() 的第3个参数，即回调函数
chrome.runtime.onMessage.addListener(function(data, _, cbf) {
  if(data.xid === config.webId.tsb) {
    tsb.mediaParser(data.url, tsbShow);
  }
  if(data.xid === config.webId.xmly) {
    $('#xmly').show();
  }
  cbf("ok");
});

// 音频/视频文件解析结果
if(typeof localStorage['MediaList'] === 'undefined') {
  localStorage['MediaList'] = JSON.stringify([]);
}

$('#showMedia').bind("click", function() {
  console.log("听书宝-显示结果");
  let mediaList = JSON.parse(localStorage['MediaList']);
  utils.consoleLog("媒体资源列表", mediaList);
});
