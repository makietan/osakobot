// scripts/osako.js
const rp = require('request-promise');
const WIKI_URL = 'http://ja.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&titles=';

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

module.exports = function(robot) {
  robot.hear(/(.*)(半端|はんぱ|ハンパ)(な|ね)/i, async function(res) {
    let word = res.match[1];
    let body = null;
    try {
      body = await rp(WIKI_URL + encodeURI(toHalfWidth(word)));
    } catch (error) {
      body = null;
    }
    if (!body) {
      res.send(word + "はんぱないって。");
      return;
    }
    let data = JSON.parse(body);
    let query = data.query;
    if (!query || !query.pages) {
      res.send(word + "はんぱないって。");
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
          res.send(
              word + 'はんぱないって。アイツはんぱないって。' +
              suru.replace('\n', '') + 
              'もん。そんなん出来ひんやん、普通。');
          return;
        }
      }
    }
    res.send(word + "はんぱないって。");
  });
}