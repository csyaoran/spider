// 在线编码转换工具
// http://www.bt.cn/tools/unicode.html
// https://www.qqxiuzi.cn/bianma/ascii.htm
// http://www.mytju.com/classcode/tools/encode_utf8.asp

// 参考代码
// https://www.jb51.net/article/99274.htm
function leftZero4(str) {
  if(str != null && str != '' && str != 'undefined') {
    if(str.length == 2) {
      return '00' + str;
    }
  }
  return str;
}

// 转 Unicode
export function toUnicode(str) {
  let value = '';
  for(let i = 0; i < str.length; i++) {
    value += '\\u' + leftZero4(parseInt(str.charCodeAt(i)).toString(16));
  }
  return value;
}

// 转 ASCII
export function toAscii(str) {
  let value = '';
  for(let i = 0; i < str.length; i++) {
    value += '&#' + str.charCodeAt(i) + ';';
  }
  return value;
}

// 逆向转换
export function reconvert(str) {
  str = str.replace(/(\\u)(\w{1,4})/gi, function($0) {
    return (String.fromCharCode(parseInt((escape($0).replace(/(%5Cu)(\w{1,4})/g,"$2")),16)));
  });
  str = str.replace(/(&#)(\d{1,6});/gi, function($0) {
    return String.fromCharCode(parseInt(escape($0).replace(/(%26%23)(\d{1,6})(%3B)/g,"$2")));
  });
  return str;
}