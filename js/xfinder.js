import * as utils from "./utils.js"
import * as config from "./config.js"

$('#tsb').hide();
$('#xmly').hide();

const readBlobAsText = (blob, encoding) => {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = event => {
      resolve(fr.result);
    };

    fr.onerror = err => {
      reject(err);
    };

    fr.readAsText(blob, encoding);
  });
}

// 接收 service-worker.js 发送的消息
//
// - data  表示 chrome.tabs.sendMessage() 的第2个参数，即数据对象
// - cbf   表示 chrome.tabs.sendMessage() 的第3个参数，即回调函数
chrome.runtime.onMessage.addListener(function(data, _, cbf) {
  if(data.xid === config.webId.tsb) {
    // fetch 获取 HTML 的 body
    //
    // 1. https://blog.ihanai.com/2019/03/fetch-parse-response-in-gbk.html
    // 2. https://www.cnblogs.com/dongxixi/p/11005607.html
    // 3. https://blog.csdn.net/weixin_39573598/article/details/117796310
    // 4. https://stackoverflow.com/questions/38004048/get-and-fetch-getting-html-body
    fetch(data.url, { method: 'get' }).then(function(response) {
      const contentType = response.headers.get('Content-Type');
      if(contentType && contentType === "text/html") {
        return response.blob().then(blob => readBlobAsText(blob, "gbk"));
      }
      return "";
    }).then(function(html) {
      try {
        let book = document.createElement( 'html' );
        book.innerHTML = html;
        console.log(book);
      } catch(error) {
        console.log(error);
      }

    }).catch(function(err) {
      console.error('Fetch Error', err);
    });
    $('#tsb').show();
  }
  if(data.xid === config.webId.xmly) {
    $('#xmly').show();
  }
  cbf("ok");
});

document.querySelector("#xprefix").addEventListener("input",function() {
  // 设置初始长度，实现回缩效果
  this.style.width = "0px";
  // 添加内容显示需要的长度
  this.style.width = this.scrollWidth + "px";
});
document.querySelector("#xsuffix").addEventListener("input",function() {
  // 设置初始长度，实现回缩效果
  this.style.width = "0px";
  // 添加内容显示需要的长度
  this.style.width = this.scrollWidth + "px";
});
document.querySelector("#xstart").addEventListener("input",function() {
  // 设置初始长度，实现回缩效果
  this.style.width = "0px";
  // 添加内容显示需要的长度
  this.style.width = 16 + this.scrollWidth + "px";
});
document.querySelector("#xstep").addEventListener("input",function() {
  // 设置初始长度，实现回缩效果
  this.style.width = "0px";
  // 添加内容显示需要的长度
  this.style.width = 16 + this.scrollWidth + "px";
});
document.querySelector("#xend").addEventListener("input",function() {
  // 设置初始长度，实现回缩效果
  this.style.width = "0px";
  // 添加内容显示需要的长度
  this.style.width = 16 + this.scrollWidth + "px";
});

// HTML5 播放器允许格式
function html5IsPlay(ext) {
  let arr = ['ogg','ogv','mp4','webm','mp3','wav','flv','m4a'];
  if(arr.indexOf(ext) > -1){
    return true;
  }
  return false;
}

function AddMedia(data) {
  utils.consoleLog("Xfinder Media Data", data);

  // 资源列表
  let html = '<div class="panel"><div class="panel-heading">';
  html += '<span>' + data.name + '</span>';
  if(data.ext == 'm3u8') {
    html += '<img src="img/parsing.png" class="ico" id="m3u8">';
  }
  html += '<input type="checkbox" class="DownCheck" checked="true"/>';

  if(data.status == "ok") {
    html += '<img src="img/download.png" class="ico" id="download">';
  } else {
    html += '<img src="img/error.png" class="ico" id="download">';
  }

  if(html5IsPlay(data.ext) ) {
    html += '<img src="img/play.png" class="ico" id="play">';
  }
  html += '<img src="img/copy.png" class="ico" id="copy">';
  html += '<span class="size">' + data.size + '</span>';
  html += '</div><div class="url"><a href="'
       + data.url + '" target="_blank" download="'
       + data.name+'">' + data.url + '</a></div>';
  html += '</div>';
  $('#medialist').append(html);

  // 左键单击显示完整地址
  $('#medialist .panel-heading').off().on('click',function() {
    let id = $(this).next();
    $(id).toggle();
  });

  // 复制下载地址
  $('#medialist #copy').off().on('click',function() {
    let url = $(this).parents().find('.url a').attr('href');
    let text = $('<input id="copy_tmp" value="'+url+'" />');
    $('body').append(text);
    text.select();
    document.execCommand('Copy');
    $('#copy_tmp').remove();
    $('#tempntc').html('已复制到剪贴板').fadeIn(500).delay(500).fadeOut(500);
  });

  // 下载
  $('#medialist #download').off().on('click',function() {
    let url = $(this).parents().find('.url a').attr('href');
    let fileName = $(this).parents().find('.url a').attr('download') + "." + data.ext;
    chrome.downloads.download({url: url, filename: fileName});
  });

  //解析m3u8
  $('#medialist #m3u8').off().on('click',function() {
    let url = $(this).parents().find('.url a').attr('href');
    chrome.tabs.create({ url: 'm3u8.html?m3u8_url=' + url });
  });

  // 播放
  $('#medialist #play').off().on('click',function() {
    let url = $(this).parents().find('.url a').attr('href');
    $('#player').appendTo($(this).parent().parent());
    $('video').attr('src',url);
    $('#player').show();

    // 播放关闭按钮
    $('#CloseBtn').bind("click", function() {
      $('video').removeAttr('src');
      $("#player").hide();
      $('#player').appendTo('body');
    });
  });

  // 下载选中文件
  $('#DownFile').off().on('click',function() {
    $('#medialist input').each(function() {
      if($(this).prop('checked')) {
        $(this).siblings('#download').click();
      }
    });
  });

  // 复制选中文件
  $('#AllCopy').off().on('click',function() {
    let url = '';
    let text = $('<textarea id="copy_tmp"></textarea>');
    $('#medialist input').each(function() {
      if($(this).prop('checked')) {
        url += $(this).parents().find('.url a').attr('href') + "\n";
      }
    });

    $(text).val(url);
    $('body').append(text);
    text.select();
    document.execCommand('Copy');
    $('#copy_tmp').remove();
    $('#tempntc').html('已复制到剪贴板').fadeIn(500).delay(500).fadeOut(500);
  });

  //全选
  $('#AllSelect').off().on('click',function() {
    $('#medialist input').each(function() {
      $(this).attr("checked",'true');
    });
  });

  //反选
  $('#ReSelect').off().on('click',function() {
    $('#medialist input').each(function() {
      if( $(this).prop('checked') ) {
        $(this).attr('checked',false);
      } else {
        $(this).attr('checked',true);
      }
    });
  });
}

function isAllDownload() {
  if($('#medialist #download').length >= 1 ) {
    $('#down').show();
    $('.DownCheck').show();
  }
}

function ShowMedia(data) {
  if(data == undefined || data.length == 0) {
    $('#tempntc').fadeIn(500);
    return;
  }

  $("#medialist").empty(); // 清空资源列表
  for(let i = 0; i < data.length; i++) {
    AddMedia(data[i]);
  }
  isAllDownload();
}

let urls_ok = [];
let urls_error = [];
let urls_timeout = [];

$('#findResources').bind("click", function() {
  const url_prefix = $('#xprefix').val();
  const url_suffix = $('#xsuffix').val();

  const xstart = parseInt($('#xstart').val());
  const xstep = parseInt($('#xstep').val());
  const xend = parseInt($('#xend').val());

  const xfext = $('#xfext').val();
  const xtimeout = parseInt($('#xtimeout').val());

  // 初始化清空
  urls_ok = [];
  urls_error = [];
  urls_timeout = [];

  for(let i = xstart; i < xend; i+=xstep) {
    const label_num = i;
    const xurl = url_prefix + i + url_suffix;
    //console.log("URL[" + i + "]: " + xurl);

    fetch(xurl, { method: 'get' }).then(function(response1) {
      //console.log(response1.url);

      /*
      // 获取不到 BODY 数据?
      fetch(response1.url, { method: 'get' }).then(function(response2) {
        console.log(response2);
      }).catch(function(err) {
        console.log('Fetch错误2: ' + err);
      });
      */

      let xhr = new XMLHttpRequest();
      // 设置超时时间ms, 0表示永不超时
      xhr.timeout = xtimeout;
      // 请求成功
      //xhr.onload = e => { console.log('XMLHttpRequest success'); };
      // 请求结束
      //xhr.onloadend = e => { console.log('XMLHttpRequest loadend'); };
      // 请求出错
      xhr.onerror = e => {
        //console.error('XMLHttpRequest error');
        urls_error.push({
          status: "error",
          name: label_num,
          url: response1.url,
          reason: 'XMLHttpRequest error'
        });
      };
      // 请求超时
      xhr.ontimeout = e => {
        //console.warn('Timeout: ' + response1.url);
        urls_timeout.push({
          status: "timeout",
          name: label_num,
          url: response1.url,
          reason: "timeout" + xtimeout + "ms"
        });
      };

      xhr.onreadystatechange = function() {
        // 通信成功时，状态值为4
        if(xhr.readyState === 4) {
          if(xhr.status === 200) {
            //console.log(xhr.responseText);
            let target = JSON.parse(xhr.responseText);
            //console.log(target.url);
            urls_ok.push({
              status: "ok",
              name: label_num,
              url: target.url,
              ext: xfext
            });
          } else {
            //console.error(xhr.statusText);
            urls_error.push({
              status: "error",
              name: label_num,
              url: response1.url,
              reason: xhr.statusText
            });
          }
        }
      };

      xhr.open('GET', response1.url, true);
      xhr.send(null);
    }).catch(function(err) {
      console.log('Fetch错误1: ' + err);
    });
  }
  utils.sleep(500);
});

$('#showUrlsLists').bind("click", function() {
  let urls = [];
  Object.assign(urls, urls_ok);
  Object.assign(urls, urls_timeout);
  Object.assign(urls, urls_error);

  // 从小打到排序
  let sortKeys = Object.keys(urls).sort((a, b) => {
    return urls[a].name - urls[b].name
  });
  let xurls = [];
  for(let index in sortKeys) {
    xurls.push(urls[sortKeys[index]]);
  }

  utils.consoleLog("Xfinder Media Urls", xurls);
  ShowMedia(xurls);
});