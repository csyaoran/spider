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

// window.localStorage vs chrome.storage.local
// https://stackoverflow.com/questions/24279495/window-localstorage-vs-chrome-storage-local
// localStorage 的读写必须放在被网页加载的JS脚本内，否则报错！
// localStorage 可以通过 Chrome 的 DevTools->Application 查看其内容
if(0) {
  // 第1种写法
  localStorage['WHAT1'] = JSON.stringify({"a":{},"b":{},"c":{}});
  let WHAT1 = JSON.parse(localStorage['WHAT1']);
  console.log(WHAT1);
  // 第2种写法
  localStorage.setItem("WHAT2", JSON.stringify(["a","b","c"]));
  let WHAT2 = JSON.parse(localStorage.getItem("WHAT2"));
  console.log(WHAT2);
  // 第3种写法
  window.localStorage.setItem("WHAT3", JSON.stringify({debug: true}));
  let WHAT3 = JSON.parse(window.localStorage.getItem("WHAT3"));
  console.log(WHAT3);
}

// xfinder 音频/视频文件解析结果
if(typeof localStorage['xMediaList'] === 'undefined') {
  localStorage['xMediaList'] = JSON.stringify([]);
}

$('#showMedia').bind("click", function() {
  console.log("听书宝-显示结果");
  let mediaList = JSON.parse(localStorage['xMediaList']);
  config.debugMsg("媒体资源列表", mediaList);
});
