import {serviceAxios} from "../../api/http";
import {XMLParser} from "fast-xml-parser";
import {createReadStream, readdirSync, readFileSync} from "fs";
import axios from 'axios';
import log from "electron-log";
// 获取webdav文件列表
export async function getWebdavFileList(ev, url, user, pass) {
  console.log(url, user, pass, 6);
  const service = new serviceAxios(url, true);
  const data = '<D:propfind xmlns:D="DAV:">\n              <D:allprop/>\n          </D:propfind>';
  const res = await service.propfind('/', {headers: {
      'Depth': '1',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'Content-Type': 'application/xml',
    }, auth: {
      username: user,
      password: pass
    },
    data
  }).catch(err => {
      return err;
  })

  const { XMLParser} = require("fast-xml-parser");
  const XMLdata = res;
  const parser = new XMLParser();
  let jObj = parser.parse(XMLdata);
  return JSON.stringify(jObj);
}

// 上传数据文件到webdav
export async function uploadWebdav(ev) {

  const service = new serviceAxios(global.Config.webdavUrl, true);
  const data = createReadStream(global.dbDir(`clipboard.db`));
  const fileList = readdirSync(global.fileDir());
  const params = {headers: {
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'Content-Type': 'application/octet-stream'
    }, auth: {
      username: global.Config.webdavUser,
      password: global.Config.webdavPass
    }}

  // 判断webdav db文件夹是否存在
  let isDb;
     await service.propfind('/db', {...params}).catch(err => {
    if (err.code == '404') {
      isDb = false;
    }
   });
  if (!isDb) {
    const mkDbDir = await service.mkcol('/db', {...params}).catch(err => {

    })
  }

  // 判断webdav file文件夹是否存在
  let isFile;
     await service.propfind('/file', {...params}).catch(err => {
    if (err.code == '404') {
      isFile = false;
    }
   });
  if (!isFile) {
    const mkDbDir = await service.mkcol('/file', {...params}).catch(err => {

    })
  }

  // 上传文件
  let listReq = [];
  fileList.forEach(item => {
    const data = createReadStream(global.fileDir(item));
      listReq.push(service.put(`/file/${item}`, {
        ...params,
        data
      }))
  })
  // 上传文件
   Promise.all(listReq).then(res => {
     console.log(res, 84);
   });

  // 上传数据库文件
  const res = await service.put('/db/clipboard.db', {
    ...params,
    data
  }).catch(err => {
    //console.log(err, 48);
      return err;
  })
  return  res;
// 创建 FormData 对象
//   const formData = new FormData();
//
// // 添加文件到 FormData
//   formData.append('file',  createReadStream(global.dbDir(`clipboard.db`)));
//
// // 发送 PUT 请求
//   axios.put(global.Config.webdavUrl + '/', formData, {
//     headers: {
//       'Depth': '1',
//       'Accept': '*/*',
//       'Connection': 'keep-alive',
//     }, auth: {
//       username: global.Config.webdavUser,
//       password: global.Config.webdavPass
//     },
//     data: formData
//   })
//     .then(response => {
//       console.log('上传成功', response.data, 70);
//     })
//     .catch(error => {
//       console.error('上传失败', error, 73);
//     });


}



