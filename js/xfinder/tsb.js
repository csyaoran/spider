import * as xchar from "./xchar.js"

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

function findMedia(info) {
  console.log("听书宝-资源解析");
  console.log(info);
}

function initHtml(bookInfo) {
  if(!bookInfo || bookInfo.media.length == 0) {
    return {ok: false};
  }
  let item = document.getElementById("tsbBookName");
  item.innerHTML = bookInfo.title;

  item = document.getElementById("tsbChapterStart");
  item.value = 0;

  item = document.getElementById("tsbChapterEnd");
  item.value = bookInfo.media.length;

  // <li><a title="第1集" href="/video/?350-0-0.html" target="_blank">第1集</a></li>
  $('#tsbFindResou').bind("click", function() {
    findMedia(bookInfo);
  });
  $('#tsbShowMedia').bind("click", function() {
    console.log("听书宝-显示结果");
  });
  return {ok: true, media: bookInfo.media, base: bookInfo.baseUrl};
}

// 获取/解析 HTML-BODY
export const mediaParser = (bookUrl, showHtml) => {
  // 1. https://blog.ihanai.com/2019/03/fetch-parse-response-in-gbk.html
  // 2. https://www.cnblogs.com/dongxixi/p/11005607.html
  // 3. https://blog.csdn.net/weixin_39573598/article/details/117796310
  // 4. https://stackoverflow.com/questions/38004048/get-and-fetch-getting-html-body
  fetch(bookUrl, { method: 'get' }).then(function(response) {
    const contentType = response.headers.get('Content-Type');
    if(contentType && contentType === "text/html") {
      return response.blob().then(blob => readBlobAsText(blob, "gbk"));
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
    console.error('TSB Media Fetch Error', err);
  });
}