const rp = require('request-promise');
const WIKI_URL = 'http://ja.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&&titles=';
const WORD = "小倉唯";

const toHalfWidth = function(string) {
  return string.replace(/[！-～]/g, (halfString) => 
      String.fromCharCode(halfString.charCodeAt(0) - 0xFEE0))
    .replace(/”/g, "\"")
    .replace(/’/g, "'")
    .replace(/‘/g, "`")
    .replace(/￥/g, "\\")
    .replace(/　/g, " ")
    .replace(/ /g, "_")
    .replace(/〜/g, "~");
};

(async function() {
  try {
    let body = await rp(WIKI_URL + encodeURI(toHalfWidth(WORD)));

    let data = JSON.parse(body);
    let query = data.query;
    
    if (!query || !query.pages) {
      return;
    }
    
    for (var key in query.pages) {
      if (!query.pages[key].extract) {
        continue;
      }
      // 不要な記号等を削除して、改行と句点で分割する
      let contents = query.pages[key].extract
        .replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'')
        .split(/[。\n]/);
      if (!contents || contents.length === 0) {
        continue;
      }
      for (var i = 0; i < contents.length; i++) {
        if (contents[i].match(/(.*)する$/i) != null) {
          let suru = contents[i];
          // 結果表示
          console.log(
              WORD + 'はんぱないって。アイツはんぱないって。' +
              suru.replace('\n', '') + 
              'もん。そんなん出来ひんやん、普通。');
          return;
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
})();