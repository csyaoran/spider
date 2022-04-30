import * as xchar from "./xchar.js"
import * as tools from "./tools.js"

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

// 解析听书宝网站播放页面获取，分析其 player/main.js 脚本
const keyPhpUrl = "http://43.129.176.64/player/key.php?url=";
function tsbJieMa(data) {
  let str = '';
  let tmp = data.split("*");
  for(let i=1; i<tmp.length; i++) {
    str += String.fromCharCode(tmp[i]);
  }
  return str;
}

function findMedia(info) {
  console.log("听书宝-资源解析");
  let chapterStart = parseInt($('#chapterStart').val());
  let chapterEnd = parseInt($('#chapterEnd').val());
  if(chapterStart < 1) {
    chapterStart = 1;
  }
  if(chapterEnd > info.media.length) {
    chapterEnd = info.media.length;
  }
  //console.log(info.baseUrl);
  for(let i=chapterStart-1; i<chapterEnd; i++) {
    let chapterName = info.media[i].chapter;
    chapterName = chapterName.replace(/'/g, "");
    let chapterUrl = info.baseUrl + info.media[i].url;
    chapterUrl = chapterUrl.replace(/'/g, "");
    //console.log(chapterName, chapterUrl);
    fetch(chapterUrl, { method: 'get' }).then(function(response) {
      // HTTP 状态码
      // https://www.runoob.com/http/http-status-codes.html
      if(response.status == 200) {
        return response.text();
        //const contentType = response.headers.get('Content-Type');
        //if(contentType && contentType === "text/html") {
        //  return response.blob().then(blob => readBlobAsText(blob, "gbk"));
        //}
      }
      return "";
    }).then(function(html) {
      if(!html) {
        console.error("获取听书宝播放页面数据失败");
        return;
      }

      let regex = /FonHen_JieMa\('([0-9\*\-]+)'\)\.split\('&'\)/;
      let magic = html.match(regex);
      let xpath = '';
      if(magic && magic.length == 2) {
        let tmp = tsbJieMa(magic[1]).split('&');
        if(tmp.length == 3 && tmp[2] == "tc") {
          xpath = tmp[0];
        }
      }
      //console.log(chapterName, xpath);
      if(!xpath) {
        console.error("解析听书宝播放页面URL路径失败");
        return;
      }

      let fileName = xpath.split('/');
      fileName = fileName[fileName.length-1];
      let jsonUrl = keyPhpUrl + xpath;
      //console.log(chapterName, fileName, jsonUrl);

      // 获取音频资源地址
      fetch(jsonUrl, { method: 'get' }).then(function(responseJSON) {
        if(responseJSON.status == 200) {
          return responseJSON.text();
        }
      }).then(function(text) {
        let mediaUrl = decodeURIComponent(JSON.parse(text).url);
        if(!mediaUrl) {
          console.error(chapterName + "播放URL获取失败", jsonUrl);
          return;
        }
        tools.addMedia({
          idx: tools.makeChapterIdx(i+1, info.media.length),
          name: [ chapterName, fileName],
          url: mediaUrl
        });
      });
    }).catch(function(err) {
      console.error('TSB Media Fetch Error', err);
    });
  }
}

function initHtml(bookInfo) {
  if(!bookInfo || bookInfo.media.length == 0) {
    return {ok: false};
  }
  let item = document.getElementById("bookName");
  item.innerHTML = bookInfo.title;

  item = document.getElementById("chapterStart");
  item.value = 1;

  item = document.getElementById("chapterEnd");
  item.value = bookInfo.media.length;

  $('#tsbFindResou').bind("click", function() {
    findMedia(bookInfo);
  });
  return {ok: true};
}

// 获取/解析 HTML-BODY
export const mediaParser = (bookUrl, showHtml) => {
  // 1. https://blog.ihanai.com/2019/03/fetch-parse-response-in-gbk.html
  // 2. https://www.cnblogs.com/dongxixi/p/11005607.html
  // 3. https://blog.csdn.net/weixin_39573598/article/details/117796310
  // 4. https://stackoverflow.com/questions/38004048/get-and-fetch-getting-html-body
  fetch(bookUrl, { method: 'get' }).then(function(response) {
    if(response.status == 200) {
      const contentType = response.headers.get('Content-Type');
      if(contentType && contentType === "text/html") {
        return response.blob().then(blob => readBlobAsText(blob, "gbk"));
      }
    }
    return "";
  }).then(function(html) {
    if(0) { // 耗时太长
      // https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
      // https://dom.spec.whatwg.org/#ref-for-dom-document-createelement%E2%91%A0
      let book = document.createElement('html');
      book.innerHTML = html;
      let li = book.getElementsByTagName('li');
      for(let i=0; i<10/* li.length */; i++) {
        console.log(li[i]);
      }
    } else {
      // 解析 HTML 网页数据
      //console.log(html);return;
      const ysxs = xchar.toUnicode("有声小说"); // 转 Unicode 编码
      let regex = new RegExp('<title>([^\s]*)' + ysxs);
      let result = html.match(regex);
      let title = '';
      if(result && result.length == 2) {
        title = result[1];
      }
      //console.log("标题", title);

      // 正则表达式
      // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions
      // 目标匹配值
      // <li><a title="第1集" href="/video/?3212-0-0.html" target="_blank">第1集</a></li>
      regex = /<li><a[\s]+title=([^\s]*)[\s]+href=([^\s]*)[\s]+target=([^\s]*)>([^<]*)<\/a><\/li>/g;
      result = html.match(regex);
      if(result) {
        const mediaList = [];
        let thReg = new RegExp("^<li><a[\\s]+title=([^\\s]*)[\\s]+href=([^\\s]*)[\\s]+target=[^\\s]*>[^<]*</a></li>$");
        for(let i=0; i<result.length; i++) {
          let thRes = result[i].match(thReg);
          if(thRes && thRes.length == 3) {
            mediaList.push({chapter: thRes[1], url: thRes[2]});
          }
        }
        //console.log(mediaList);
        showHtml(initHtml({
          title: title,
          baseUrl: "http://m.tingshubao.com",
          media: mediaList
        }));
      }
    }
  }).catch(function(err) {
    console.error('TSB Book List Fetch Error', err);
  });
}