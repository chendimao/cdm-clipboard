// 字节转换
export function byteConvert(bytes) {
  if (isNaN(bytes)) {
    return '';
  }
  let symbols = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let exp = Math.floor(Math.log(bytes)/Math.log(2));
  if (exp < 1) {
    exp = 0;
  }
  let i = Math.floor(exp / 10);
  bytes = bytes / Math.pow(2, 10 * i);

  if (bytes.toString().length > bytes.toFixed(2).toString().length) {
    bytes = bytes.toFixed(2);
  }
  return bytes + ' ' + symbols[i];
}


//搜索高亮
export function brightenKeyword(val, keyword) {
  if(!keyword) return val;
  // 匹配关键字正则
  return val.replace(new RegExp(keyword, 'gi'), `<span class="text-[red] bg-[#DCF89D]">${keyword}</span>`);
}

export function escapeHtml(str) {
  var temp = "";
  if(str.length == 0) return "";
  temp = str.replace(/&/g,"&amp;");
  temp = temp.replace(/</g,"&lt;");
  temp = temp.replace(/>/g,"&gt;");
  temp = temp.replace(/\s/g,"&nbsp;");
  temp = temp.replace(/\'/g,"&#39;");
  temp = temp.replace(/\"/g,"&quot;");
  return temp;
}
