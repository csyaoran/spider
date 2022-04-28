export function consoleLog(label=null, msg=null) {
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

  chrome.storage.local.get(['xDebug'], function(data) {
    if(data.xDebug) {
      console.log("-------- " + label + " --------");
      console.log(msg);
      console.log(infomsg);
    }
  });
}

export function skipChromeStuff(url) {
  // chrome://*
  // chrome-extension://*
  let tmp = url.split("/"); // url按/分割
  if(tmp[0] == "chrome-extension:" || tmp[0] == "chrome:") {
    return true; // 不再新建 xfinder.html 页面
  }
  return false;
}

export function getFileName(url) {
  let str = url.split("?"); // url按？分开
  str = str[0].split( "/" ); // 按/分开
  str = str[str.length-1].split( "#" ); // 按#分开
  return str[0].toLowerCase(); // 得到带后缀的名字
}

// 获取小写格式扩展名
export function getExt(FileName) {
  let str=FileName.split(".");
  if(str.length == 1) {
    return null;
  }
  let ext = str[str.length-1];
  ext = ext.match(/[0-9a-zA-Z]*/);
  return ext[0].toLowerCase();
}

export function getHeaderValue(name, data) {
  name = name.toLowerCase();
  for(let i = 0; i<data.responseHeaders.length; i++) {
    if(data.responseHeaders[i].name.toLowerCase() == name) {
      return data.responseHeaders[i].value.toLowerCase();
    }
  }
  return null;
}

export function sleep(ms) {
  let start = new Date().getTime();
  while(new Date().getTime() < start + ms) /* Nothing */;
}

const META_CHARS = ['$', '^', '[', ']', '(', ')', '{', '}', '|', '+', '.', '\\'];
function metaSearch(ch) {
  for(let metaCh in META_CHARS) {
    if(ch == metaCh ) {
      return true;
    }
  }
  return false;
}

// 通配符判断
export function wildcard(pattern, word) {
  let result =  "^";
  for(let i=0;i<pattern.length;i++) {
    let ch = pattern.charAt(i);
    if(metaSearch(ch)) {
      result += "\\" + ch;
      continue;
    } else {
      switch(ch) {
        case '*':
          result += ".*";
          break;
        case '?':
          result += ".{0,1}";
          break;
        default:
          result += ch;
      }
    }
  }
  result += "$";
  if(word.match(result) == null) {
    return false;
  }
  return true;
}