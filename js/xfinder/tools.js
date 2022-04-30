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

// 构建资源列表
export function addMedia(data) {
  let mediaList = JSON.parse(localStorage['MediaList']);
  if(data.init) { // 清空列表
    mediaList = [];
  }

  let tmp = {};
  tmp[data.idx] = {
    url: data.url,
    cName: data.name[0],
    fName: data.name[1]
  };

  mediaList.push(tmp);
  localStorage['MediaList'] = JSON.stringify(mediaList);
}