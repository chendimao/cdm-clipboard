import {clipboard, ipcMain, BrowserWindow, BrowserView, shell, app, Notification} from 'electron';
import {
  copyFileToCache,
  getDownLoadUrl,
  getFileHash, getHash,
  getRandomHash
} from '../utils/index';
import  {extname, basename, dirname} from "path";
import {
  deleteDB, execInsertSqlTransaction,
  execQuerySql,
  execSql,
  execUpdateSql,
  getDB,
  getDbList,
  insertDB,
  updateDB
} from "../utils/database";
import logger from '../utils/logs.js';
import {deleteFile, getFileIcon} from "./common";
import {existsSync, lstat, lstatSync, statSync} from "fs";
import dayjs from "dayjs";
const clipboardListener = require('clipboard-event');
const robot = require('robotjs');
const { betterClipboard } = require('better-clipboard')

let params =  {text: '', html: '', file: '', rtf: '', img: '', cache: ''};

 // import {app} from '@electron/remote';



clipboardListener.startListening();
clipboardListener.on('change', () => {
  getClipboardFiles();
});


// 获取剪切板上文件路径
export function getClipboardFiles () {

  params.text = '';
  params.html = '';
  params.file =  '';
  params.rtf = '';
  params.img = '';
  params.cache = '';

  // 判断剪切板类型
  let hash = '';
  let type = '';
  for (const item of  clipboard.availableFormats()) {
    console.log(item, 44);

    if (item === 'text/plain') {
      params.text = clipboard.readText()
      hash = getHash(params.text);
      type = 'text';
    } else if (item === 'text/html') {
      params.html = clipboard.readHTML()
    }else if (item === 'text/rtf') {
      params.rtf =  clipboard.readRTF()
    }else if (item === 'image/png') {
      const img = clipboard.readImage().toPNG();
      type =  'img';
      hash = getFileHash(img);
      params.img = getDownLoadUrl(hash, 'png', img);
    //  console.log(params.img);
      params.cache = params.img;
      params.info = statSync(params.img);
      params.size = params.info.size;
      //数据写入缓存表
      insertOrUpdateCache([{hash, img: params.img, type, size: params.size, info: JSON.stringify(params.info),  cache: params.cache, drive: global.driveId, syncTime: '', syncStatus: 0, time: dayjs().format('YYYY-MM-DD HH:mm:ss')}])
      break;
    }else if (item === 'text/uri-list') {
      type =  'file';

      const fileList = betterClipboard.readFilePathList();




      // 记录被过滤的文件和文件夹
      let filteredDir = []; // 不缓存文件夹
      let filteredMaxFile = []; // 不缓存过大文件

      params.file = fileList.map(i => {
        const stat = lstatSync(i);

        if ( stat.isFile()) {
          // 如果文件过大
          if (stat.size > 1024 * 1024 * global.userConfig.fileSize) filteredMaxFile.push(i);
        } else {
          filteredDir.push(i);
        }
        return i;

      });
      params.info = [];
      params.size = [];
      const isCacheFile = global.userConfig.isCacheFile;
      // 如果文件列表不为空
      if (params.file.length > 0) {
        // 如果开启了缓存配置 cache使用缓存路径，否则使用原始路径
        if (isCacheFile) {

          hash = getHash(params.file.map(i => global.fileDir(basename(i))).join(','));
        } else {

          hash = getHash(params.file.join(','));
        }


        // 整理参数并将文件写入缓存目录
        let cacheList = [];
        const insertData = params.file.map(item => {
          const info = statSync(item);
         // console.log(info.isDirectory());
          params.info.push(JSON.stringify(info));
          params.size.push(info.size);

          // 如果是文件，且开启了缓存文件配置 且没有超过文件大小上限 缓存文件
          let tmpCache = item;
          if(info.isFile() && isCacheFile &&(info.size <= 1024 * 1024 * global.userConfig.fileSize)) {
            copyFileToCache(item, global.fileDir(basename(item)));
            tmpCache = global.fileDir(basename(item))
          }
          cacheList.push(tmpCache);
          return {
            hash,
            file: item,
            cache: tmpCache,
            size: info.size,
            info: JSON.stringify(info),
            drive: global.driveId,
            syncTime: '',
            syncStatus: 0,
            time: dayjs().format('YYYY-MM-DD HH:mm:ss')
          }
        })
        params.cache = cacheList.join('??::');
        // params.info =  params.info.split('??::');
        // params.size =  params.size.split('??::');

        //数据写入缓存表
        insertOrUpdateCache(insertData)
      }

      // 将文件列表中的文件夹转为字符串并写入剪切板
     // clipboard.writeText(fileList.filter(i => lstatSync(i).isDirectory()).join('\r\n'));

      // params.file = clipboard.readBuffer('FileNameW').toString('ucs2').replace(RegExp(String.fromCharCode(0), 'g'), '')


      //错误信息提示
      if (filteredDir.length > 0 || filteredMaxFile.length > 0) {
        const dirBody = filteredDir.length > 0 ? `文件夹未被缓存：\r\n` + filteredDir.map(item => `${item}\r\n`): '';
        const maxFileBody = filteredMaxFile.length > 0 ? `超过设置大小${global.userConfig.fileSize}MB：\r\n` + filteredMaxFile.map(item => `${item}\r\n`): '';
        new Notification({title: '请注意以下文件或目录', body: dirBody + maxFileBody}).show();
      }


    }





  }
  // 禁止复制空格
  if (!hash) {
    return;
  }
  if (type === 'text' &&  !params.text.trim()  ) {
    return;
  }
 // console.log(clipboard.availableFormats(), betterClipboard.readFilePathList(), params, 62);
  //判断文件或文本hash是否已存在
  // 如果不存在则插入数据
  //console.log(getDB(hash));
  if (!getDB(hash)) {
      const insertData = {text: params.text, html: params.html, rtf: params.rtf, hash, type, syncTime: dayjs().format('YYYY-MM-DD HH:mm:ss'), syncStatus: 0,  time: dayjs().format('YYYY-MM-DD HH:mm:ss')};
    const res = insertDB(insertData)
      if (type == 'file') {
        params.size = params.size.join('??::');
        params.info = params.info.join('??::');
      }
    //console.log(insertData, params, params.info, 186);
    BrowserWindow.fromId(global.mainId).webContents.send('setClipboard', {...params, ...insertData})
  } else {
    const update = updateDB('Clipboard', {time: dayjs().format('YYYY-MM-DD HH:mm:ss')}, hash);
      params = getDB( hash);

        // let sql = `SELECT * FROM Cache WHERE hash = '${hash}'`;
        // const fileList = execQuerySql( sql)
        // params[params.type] = fileList.map(item => item.cache);
        //

    BrowserWindow.fromId(global.mainId).webContents.send('updateData', params)
   // console.log(params, 81);
  }
 return params;
 //return getClipboard();
}





// 获取剪切板列表
export async function getClipboardList(event, params, keyword, limit, offset) {
  const clipboardData =  getDbList( params, keyword, limit, offset);




  return clipboardData


}

// 设置双击项为当前剪切项
export function setCurrentClipboard(event, hash, type = 'text') {
  //console.log(hash, 214);
  // 判断修改的是否为文件或图片路径
  const isFile = ['file', 'img'].includes(type);
    let  data = '';
      if (isFile) {
        let sql = `SELECT * FROM Cache WHERE hash = '${hash}'`;
        const fileList = execQuerySql( sql)
        data = fileList.map(item => item.cache);
      } else {
        data = getDB(  hash)
      }
  //console.log(data, 233);
    // 如果为文件则设置文件剪切板
    if (isFile) {
       if (type == 'file') {
         const existsFile = data.filter(item => existsSync(item));
         const noExistsFile = data.filter(item => !existsSync(item));
        // console.log(existsFile, noExistsFile, 239);
         betterClipboard.writeFileList(existsFile);
         if (noExistsFile.length >0) {
           new Notification({title: '温馨提示', body:'以下文件不存在，已过滤:\r\n' + noExistsFile.join('\r\n')}).show();
         }

       } else {
         clipboard.writeImage(data[0])
       }

    } else {
      clipboard.write({
        text: data.text,
        html: data.html,
        rtf: data.rtf
      })
    }
   // console.log(data.text);
    BrowserWindow.fromId(global.mainId).blur();

    // 模拟组合键，例如Ctrl+v
    // robot.keyTap('v', ['control']);
    return data || false;


}

// 删除剪切板
export function deleteClipboard(event, hash, type) {
 // console.log(hash, 153);
  const res = getDB( hash)
 // console.log(hash, type, 166);
  if(res) {
    deleteDB('Clipboard', hash);

    if (['img', 'file'].includes(type)) {

      const sql = `select cache from Cache where drive = '${global.driveId}' and hash = '${hash}'`;
      const fileList = execQuerySql(sql)
     // console.log(fileList);
     // console.log(fileList, 200);
      // 同时删除缓存文件
      fileList.forEach(item => {
        deleteFile(item.cache);
      })
      deleteDB('Cache', hash);
    }

    return true;
  }
}

// 单独复制文件
export function isCopyFile(ev, data) {
  betterClipboard.writeFileList(data);
  return true;
}






//写入或更新缓存
function insertOrUpdateCache(data) {
  //根据hash和drive字段查询cache表
 const res =  execQuerySql(`select * from Cache where hash = '${data[0].hash}' and drive = '${data[0].drive}'`);
 //console.log(res, 163);
  if (res.length === 0) {
    execInsertSqlTransaction('Cache', data);
  } else {
  //  console.log('update', 166);
    const sql = `update Cache SET time = '${dayjs().format('YYYY-MM-DD HH:mm:ss')}' where hash = '${data[0].hash}' and drive = '${global.driveId}'`;
    const updateCache = execUpdateSql(sql);
   // console.log(updateCache);
  }


  //execSql('INSERT OR REPLACE INTO Cache(hash, data) VALUES(?, ?)', [data.hash, JSON.stringify()]);

}









