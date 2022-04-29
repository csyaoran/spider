import * as utils from "../utils.js"
import * as config from "../config.js"

import * as tsb from "./tsb.js";

$('#tsb').hide();
$('#xmly').hide();
$('#ysts8').hide();
$('#showNote').show();

function tsbShow(info) {
  if(!info.ok) {
    return;
  }
  console.log("xxxyyyzzz");
  $('#tsb').show();
  $('#xmly').hide();
  $('#ysts8').hide();
  $('#showNote').hide();
}
function xmlyShow(info) {
  $('#tsb').hide();
  $('#xmly').show();
  $('#ysts8').hide();
  $('#showNote').hide();
}
function ysts8Show(info) {
  $('#tsb').hide();
  $('#xmly').hide();
  $('#ysts8').show();
  $('#showNote').hide();
}
function showNote(info) {
  $('#tsb').hide();
  $('#xmly').hide();
  $('#ysts8').hide();
  $('#showNote').show();
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