// Debug状态 页面显示
chrome.storage.local.get(['xDebug'], function(data) {
  if(data.xDebug) {
    $('#xDebug').attr("checked","checked");
  }
});
// Debug状态 即时保存
$('#xDebug').bind("click", function() {
  if(!$(this).prop("checked")) {
    $('#xDebug').removeAttr("checked");
    chrome.storage.local.set({"xDebug": false});
  } else {
    $('#xDebug').attr("checked", "true");
    chrome.storage.local.set({"xDebug": true});
  }
});

// 删除URL重复参数 页面显示
chrome.storage.local.get(['xIgnArgs'], function(data) {
  if(data.xIgnArgs) {
    $('#xIgnArgs').attr("checked", "checked");
  }
});
// 删除URL重复参数 即时保存
$('#xIgnArgs').bind("click", function() {
  if(!$(this).prop("checked")) {
    $('#xIgnArgs').removeAttr("checked");
    chrome.storage.local.set({"xIgnArgs": false});
  } else {
    $('#xIgnArgs').attr("checked","true");
    chrome.storage.local.set({"xIgnArgs": true});
  }
});
// 删除URL重复参数正则表达式 页面显示
chrome.storage.local.get(['xIgnArgsReg'], function(data) {
  $('#xIgnArgsReg').val(data.xIgnArgsReg);
});

// 网页标题做文件名 页面显示
chrome.storage.local.get(['xUseTitleName'], function(data) {
  if(data.xUseTitleName) {
    $('#xUseTitleName').attr("checked","checked");
  }
});
// 网页标题做文件名 即时保存
$('#xUseTitleName').bind("click", function() {
  if(!$(this).prop("checked")) {
    $('#xUseTitleName').removeAttr("checked");
    chrome.storage.local.set({"xUseTitleName": false});
  } else {
    $('#xUseTitleName').attr("checked","true");
    chrome.storage.local.set({"xUseTitleName": true});
  }
});

// 返回 HTML 格式媒体资源
function getHtmlExt() {
  let ext = arguments[0] ? arguments[0]: '';
  let size = arguments[1] ? arguments[1]: '0';
  return '<tr><td><input type="text" class="ext" placeholder="扩展名" value="'
    + ext + '"></td><td class="TdSize"><input type="text" class="size" placeholder="大小限制" value="'
    + size + '"></td><td class="SizeButton">kb</td><td id="xExtRemove" class="RemoveButton">X</td></tr>';
}
// 媒体资源 页面显示
chrome.storage.local.get(['xExt'], function(data) {
  for(let i = 0; i < data.xExt.length; i++){
    $('#xExt').append(getHtmlExt(data.xExt[i].ext, data.xExt[i].size));
  }
  // 媒体资源 删除
  $('#xExtRemove*').bind("click", function() {
    $(this).parent().remove();
  });
});
// 媒体资源 新增
$('#xExtAdd').bind("click", function() {
  $('#xExt').append(getHtmlExt());
  // 添加删除按钮
  $('#xExtRemove*').bind("click", function() {
    $(this).parent().remove();
  });
});

// 返回 HTML 格式 MIME 类型
function getHtmlMimeType() {
  let Type = arguments[0] ? arguments[0]: '';
  return '<tr><td><input type="text" class="Type" placeholder="MIME类型" value="'
    + Type + '"></td><td id="xMimeTypeRemove" class="RemoveButton">X</td></tr>';
}
// MIME类型 页面显示
chrome.storage.local.get(['xMimeType'], function(data) {
  for(let i = 0; i < data.xMimeType.length; i++){
    $('#xMimeType').append(getHtmlMimeType(data.xMimeType[i].Type));
  }
  // MIME类型 删除
  $('#xMimeTypeRemove*').bind("click", function() {
    $(this).parent().remove();
  });
});
// MIME类型 新增
$('#xMimeTypeAdd').bind("click", function() {
  $('#xMimeType').append(getHtmlMimeType());
  // 添加删除按钮
  $('#xMimeTypeRemove*').bind("click", function() {
    $(this).parent().remove();
  });
});

// 提示
function promptMsg(str, sec) {
  $('#promptMsg').html(str);
  $('.tempntc').fadeIn(500).delay(sec).fadeOut(500);
}

// 保存
$('#saveBtn').bind("click", function() {
  chrome.storage.local.set({"xIgnArgsReg": $('#xIgnArgsReg').val()});

  let Ext = new Array();
  $('#xExt tr').each(function(i) {
    let Tempext = $(this).find('.ext').val();
    if(Tempext == null || Tempext == undefined || Tempext == '') {
      promptMsg('扩展名为空', 1000);
      return false;
    }

    let Tempsize = $(this).find('.size').val();
    if(Tempsize == null || Tempsize == undefined || Tempsize == '') {
      Tempsize = 0;
      $(this).find('.size').val('0');
    }
    Ext[i] = {"ext":Tempext, "size":Tempsize};
  });
  chrome.storage.local.set({"xExt": Ext});

  let Type = new Array();
  $('#xMimeType tr').each(function(i) {
    let Tempext = $(this).find('.Type').val();
    if(Tempext == null || Tempext == undefined || Tempext == '') {
      promptMsg('MIME类型为空', 1000);
      return false;
    }
    Type[i] = {"Type": Tempext};
  });
  chrome.storage.local.set({"xMimeType": Type});

  promptMsg('已保存', 1000);
});

// 重置
$('#resetBtn').bind("click", function() {
  //location.reload();
  chrome.runtime.reload();
});