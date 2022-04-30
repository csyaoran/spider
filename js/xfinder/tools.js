import * as utils from "../utils.js"

// idx 数字，当前章节索引号
// max 数字，有声小说总共章节
export function makeChapterIdx(idx, max) {
  let strIdx = String(idx);
  let val = String(max).length - strIdx.length;
  //console.log(idx, max, val);
  if(val == 0) {
    return idx;
  } else if(val == 1) {
    return "0" + strIdx;
  } else if(val == 2) {
    return "00" + strIdx;
  } else if(val == 3) {
    return "000" + strIdx;
  } else if(val == 4) {
    return "0000" + strIdx;
  } else if(val == 5) {
    return "00000" + strIdx;
  } else if(val == 6) {
    return "000000" + strIdx;
  }
}

export function addMedia(data) {
  utils.consoleLog("Xfinder Add Media", data);

  // 资源列表
  let html = '<li><a title="' + data.name[0] + '" href="'
    + data.url + '">' + data.name[0] + '</a></li>';

  $('#medialist').append(html);
}