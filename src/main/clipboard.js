import {clipboard, ipcMain, BrowserWindow, BrowserView, shell, app} from 'electron';
import {
  copyFileToCache,
  downloadFileToFolder,
  downloadFileToFolderNode,
  getDownLoadUrl,
  getFileHash, getHash,
  getRandomHash
} from '../utils/index';
import path, {basename} from "path";
import {
  deleteDB, execInsertSqlTransaction,
  execQuerySql,
  execSql,
  execUpdateSql,
  getDB,
  getDbList,
  insertCache,
  insertDB,
  updateDB
} from "../utils/database";
import logger from '../utils/logs.js';
import {deleteFile} from "./common";
import {lstatSync} from "fs";
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
      //数据写入缓存表
      insertOrUpdateCache([{hash, img: params.img,  cache: params.cache, drive: global.driveId, syncTime: '', syncStatus: 0, time: new Date().getTime()}])
      break;
    }else if (item === 'text/uri-list') {
      type =  'file';
      //文件列表转为字符串存入数据库 过滤文件夹
      params.file = betterClipboard.readFilePathList().filter(i => lstatSync(i).isFile());
      params.cache = params.file.map(i => global.fileDir(basename(i))).join('??::');
      hash = getHash(params.file.map(i => global.fileDir(basename(i))).join(','));

      // 整理参数并将文件写入缓存目录
      const insertData = params.file.map(item => {
        copyFileToCache(item, global.fileDir(basename(item)));
        return {hash,file: item, cache: global.fileDir(basename(item)), drive: global.driveId, syncTime: '', syncStatus: 0, time: new Date().getTime()}
      })
      //数据写入缓存表
      insertOrUpdateCache(insertData)
      // params.file = clipboard.readBuffer('FileNameW').toString('ucs2').replace(RegExp(String.fromCharCode(0), 'g'), '')
    }

  }
 // console.log(clipboard.availableFormats(), betterClipboard.readFilePathList(), params, 62);
  //判断文件或文本hash是否已存在
  // 如果不存在则插入数据
  if (!getDB('Clipboard', hash)) {
      const insertData = {...params, hash, type, syncTime: new Date().getTime(), syncStatus: 0,  time: new Date().getTime()};
    const res = insertDB(insertData)
    //console.log(global.mainId, params, 94);
    BrowserWindow.fromId(global.mainId).webContents.send('setClipboard', insertData)
  } else {
    const update = updateDB('Clipboard', {time: new Date().getTime()}, hash);
      params = getDB('Clipboard', hash);

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
export function getClipboardList(event, params) {
  const clipboardData =  getDbList('Clipboard', params);
  return clipboardData


}

// 设置双击项为当前剪切项
export function setCurrentClipboard(event, hash, type = 'text') {

  // 判断修改的是否为文件或图片
  const isFile = ['file', 'img'].includes(type);
    let  data = '';
      if (isFile) {
        let sql = `SELECT * FROM Cache WHERE hash = '${hash}'`;
        const fileList = execQuerySql( sql)
        data = fileList.map(item => item.cache);
      } else {
        data = getDB( 'Clipboard', hash)
      }

    // 如果为文件则设置文件剪切板
    if (isFile) {
      type === 'file' ? betterClipboard.writeFileList(data) :  clipboard.writeImage(data[0]);
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
    robot.keyTap('v', ['control']);
    return data || false;


}

// 删除剪切板
export function deleteClipboard(event, hash, type) {
 // console.log(hash, 153);
  const res = getDB('Clipboard', hash)
  console.log(hash, type, 166);
  if(res) {
    deleteDB('Clipboard', hash);

    if (['img', 'file'].includes(type)) {

      const sql = `select cache from Cache where drive = '${global.driveId}' and hash = '${hash}'`;
      const fileList = execQuerySql(sql)
      console.log(fileList);
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



//写入或更新缓存
function insertOrUpdateCache(data) {
  //根据hash和drive字段查询cache表
 const res =  execQuerySql(`select * from Cache where hash = '${data[0].hash}' and drive = '${data[0].drive}'`);
 console.log(res, 163);
  if (res.length === 0) {
    execInsertSqlTransaction('Cache', data);
  } else {
  //  console.log('update', 166);
    const sql = `update Cache SET time = '${new Date().getTime()}' where hash = '${data[0].hash}' and drive = '${global.driveId}'`;
    const updateCache = execUpdateSql(sql);
    console.log(updateCache);
  }


  //execSql('INSERT OR REPLACE INTO Cache(hash, data) VALUES(?, ?)', [data.hash, JSON.stringify()]);
  //insertCache(data)
}









