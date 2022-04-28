chrome.storage.local.get(['xDebug'], function(data) {
  if(data.xDebug) {
    $('#Debug').attr("checked","checked");
  }
});

$('#Debug').bind("click", function() {
  if(!$(this).prop("checked")) {
    $('#Debug').removeAttr("checked");
    chrome.storage.local.set({"xDebug": false});
  } else {
    $('#Debug').attr("checked", "true");
    chrome.storage.local.set({"xDebug": true});
  }
});

chrome.storage.local.get(['xRepeat'], function(data) {
  if(data.xRepeat) {
    $('#repeat').attr("checked", "checked");
  }
});

// 去除重复选项
$('#repeat').bind("click", function() {
  if(!$(this).prop("checked")) {
    $('#repeat').removeAttr("checked");
    chrome.storage.local.set({"xRepeat": false});
  } else {
    $('#repeat').attr("checked","true");
    chrome.storage.local.set({"xRepeat": true});
  }
});

chrome.storage.local.get(['xFileName'], function(data) {
  if(data.xFileName) {
    $('#TitleName').attr("checked","checked");
  }
});

// 使用网页标题做文件名
$('#TitleName').bind("click", function() {
  if(!$(this).prop("checked")){
    $('#TitleName').removeAttr("checked");
    chrome.storage.local.set({"xFileName": false});
  } else {
    $('#TitleName').attr("checked","true");
    chrome.storage.local.set({"xFileName": true});
  }
});

chrome.storage.local.get(['xExt'], function(data) {
  for(let i = 0; i < data.xExt.length; i++){
    $('#ExtTd').append(GethtmlExt(data.xExt[i].ext, data.xExt[i].size));
  }
});

chrome.storage.local.get(['xMimeType'], function(data) {
  for(let i = 0; i < data.xMimeType.length; i++){
    $('#ExtTy').append(GethtmlType(data.xMimeType[i].Type));
  }
});

chrome.storage.local.get(['xRepeatReg'], function(data) {
  $('#repeatReg').val(data.xRepeatReg);
});

// 新增格式
$('#AddExt').bind("click", function() {
  $('#ExtTd').append(GethtmlExt());
  //删除
  $('#RemoveExt*').bind("click", function() {
    $(this).parent().remove();
  });
});

// 新增MIME类型
$('#AddType').bind("click", function() {
  $('#ExtTy').append(GethtmlType());
  //删除
  $('#RemoveType*').bind("click", function() {
    $(this).parent().remove();
  });
});

// 获得HTML格式
function GethtmlExt() {
  let ext = arguments[0] ? arguments[0]: '';
  let size = arguments[1] ? arguments[1]: '0';
  return '<tr><td><input type="text" class="ext" placeholder="扩展名" value="'
    + ext + '"></td><td class="TdSize"><input type="text" class="size" placeholder="大小限制" value="'
    + size + '"></td><td class="SizeButton">kb</td><td id="RemoveExt" class="RemoveButton">X</td></tr>';
}

// 获得 HTML-TYPE
function GethtmlType() {
  let Type = arguments[0] ? arguments[0]: '';
  return '<tr><td><input type="text" class="Type" placeholder="MIME类型" value="'
    + Type + '"></td><td id="RemoveType" class="RemoveButton">X</td></tr>';
}

// 提示
function Prompt(str,sec) {
  $('#TempntcText').html(str);
  $('.tempntc').fadeIn(500).delay(sec).fadeOut(500);
}

// 删除格式
$('#RemoveExt*').bind("click", function() {
  $(this).parent().remove();
});

// 删除类型
$('#RemoveType*').bind("click", function() {
  $(this).parent().remove();
});

// 保存
$('#SaveExt').bind("click", function() {
  let Type = new Array();
  let Ext = new Array();
  let success = true;
  $('#ExtTd tr').each(function(i) {
    let Tempext = $(this).find('.ext').val();
    if(Tempext == null || Tempext == undefined || Tempext == '') {
      Prompt('扩展名为空', 1000);
      success = false;
      return false;
    }

    let Tempsize = $(this).find('.size').val();
    if(Tempsize == null || Tempsize == undefined || Tempsize == '') {
      Tempsize = 0;
      $(this).find('.size').val('0');
    }
    Ext[i] = {"ext":Tempext, "size":Tempsize};
  });

  $('#ExtTy tr').each(function(i) {
    let Tempext = $(this).find('.Type').val();
    if(Tempext == null || Tempext == undefined || Tempext == '') {
      Prompt('MIME类型为空', 1000);
      success = false;
      return false;
    }
    Type[i] = {"Type": Tempext};
  });

  chrome.storage.local.set({"xRepeatReg": $('#repeatReg').val()});

  if(success) {
    chrome.storage.local.set({"xExt": Ext});
    chrome.storage.local.set({"xMimeType": Type});
    Prompt('已保存', 1000);
  }
});

// 重置
$('#ResetExt').bind("click", function() {
  location.reload();
});