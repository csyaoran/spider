import * as config from "./config.js"

chrome.windows.getCurrent(function(wnd) {
  chrome.tabs.query({windowId: wnd.id}, function(tabs) {
    for(let i=0; i<tabs.length; i++) {
      if(tabs[i].active) {
        // 发送消息给 ServiceWorker 请求当前 Tab 页面解析得到的音频/视频数据
        chrome.runtime.sendMessage({xid: "popup",tid: tabs[i].id}, (data) => {
          ShowMedia(data);
        });
      }
    }
  });
});

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
  for(let i = 0; i < data.length; i++) {
    AddMedia(data[i]);
  }
  isAllDownload();
}

// HTML5 播放器允许格式
function html5IsPlay(ext) {
  let arr = ['ogg','ogv','mp4','webm','mp3','wav','flv','m4a'];
  if(arr.indexOf(ext) > -1) {
    return true;
  }
  return false;
}

function AddMedia(data) {
  config.debugMsg("Popup Media Data", data);

  // 文件名是否为空
  if(data.name == undefined || data.name == '') {
    data.name = data.title;
  }

  // 网页标题加扩展名作为文件名
  let isOK = {data: false};
  let SaveAsName = data.name;
  chrome.storage.local.get(['xUseTitleName'], function(data) {
    Object.assign(isOK, {data: data.xUseTitleName});
  });

  if(isOK.data) {
    if(data.ext) {
      SaveAsName = data.title + '.' + data.ext;
    } else {
      SaveAsName = data.title;
    }
  } else {
    SaveAsName = data.name;
  }

  // 截取文件名长度
  let shortName = data.name;
  if(shortName.length >= 43) {
    shortName = shortName.replace(/\.[^.\/]+$/, "");
    shortName = shortName.substr(0,13) + '...' + shortName.substr(-20)+ '.' + data.ext;
  }

  if(shortName.length == 0) {
    shortName = "anonymous." + data.ext;
  }

  if(SaveAsName.length == 0) {
    SaveAsName = "anonymous." + data.ext;
  }

  if(data.type == 'application/octet-stream' ) {
    data.size = '[stream]';
  }

  // 资源列表
  let html = '<div class="panel"><div class="panel-heading">';
  html += '<span>' + shortName + '</span>';
  if(data.ext == 'm3u8') {
    html += '<img src="img/parsing.png" class="ico" id="m3u8">';
  }
  html += '<input type="checkbox" class="DownCheck" checked="true"/>';
  html += '<img src="img/download.png" class="ico" id="download">';
  if(html5IsPlay(data.ext) ) {
    html += '<img src="img/play.png" class="ico" id="play">';
  }
  html += '<img src="img/copy.png" class="ico" id="copy">';
  html += '<span class="size">' + data.size + '</span>';
  html += '</div><div class="url"><a href="'
       + data.url + '" target="_blank" download="'
       + SaveAsName +'">' + data.url + '</a></div>';
  html += '</div>';
  $('#medialist').append(html);

  // 左键单击显示完整地址
  $('#medialist .panel-heading').off().on('click',function() {
    let id = $(this).next();
    $(id).toggle();
  });

  // 复制下载地址
  $('#medialist #copy').off().on('click',function(){
    let url = $(this).parents().find('.url a').attr('href');
    let text = $('<input id="copy_tmp" value="'+url+'" />');
    $('body').append(text);
    text.select();
    document.execCommand('Copy');
    $('#copy_tmp').remove();
    $('#tempntc').html('已复制到剪贴板').fadeIn(500).delay(500).fadeOut(500);
  });

  // 下载
  $('#medialist #download').off().on('click',function(){
    let url = $(this).parents().find('.url a').attr('href');
    let fileName = $(this).parents().find('.url a').attr('download');
    chrome.downloads.download({url: url, filename: fileName});
  });

  // 解析m3u8
  $('#medialist #m3u8').off().on('click',function() {
    let url = $(this).parents().find('.url a').attr('href');
    chrome.tabs.create({ url: '/m3u8.html?m3u8_url='+url });
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

  // 全选
  $('#AllSelect').off().on('click',function() {
    $('#medialist input').each(function() {
      $(this).attr("checked", 'true');
    });
  });

  // 反选
  $('#ReSelect').off().on('click',function() {
    $('#medialist input').each(function() {
      if($(this).prop('checked')) {
        $(this).attr('checked', false);
      } else {
        $(this).attr('checked', true);
      }
    });
  });
}