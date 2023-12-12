
//import  remote from '@electron/remote';

/**
 *  description: 下载文件到指定目录
 *  param {string} url 文件下载链接
 *  param {string} fileName 文件名称
 *  param {string} fileType 文件格式
 *  author: longyunfei
 */
const fs = require('fs')
const path = require('path')
import {app, BrowserWindow  } from 'electron'
import crypto from 'crypto';
export function downloadFileToFolder(  join, url, fileName, fileType) {
  BrowserWindow.fromId(global.mainId).webContents.downloadURL(url);
  BrowserWindow.fromId(global.mainId).webContents.session.once('will-download', (event, item, webContents) => {
        //设置保存路径
        const filePath = join(app.getPath('userData'), '/download', `${fileName}.${fileType}`);
        console.log(filePath);
        item.setSavePath(filePath);
        item.on('updated', (event, state) => {
          if (state === 'interrupted') {
            console.log('下载中断，可以继续');
          } else if (state === 'progressing') {
            if (item.isPaused()) {
              console.log('下载暂停');
            } else {
              console.log(`byte:${item.getReceivedBytes()}`);
              console.log(`ok：${item.getReceivedBytes() / item.getTotalBytes() * 100}`);
            }
          }
        });

    })
}

//将流转换为下载地址
export function  getDownLoadUrl(fileName, fileType, data) {
  console.log(app.getPath('userData'), 40);
   if (!fs.existsSync(app.getPath('userData') + '/data')) {
       fs.mkdirSync(app.getPath('userData') + '/data');
   }

  if (!fs.existsSync(app.getPath('userData') + '/data/file')) {
       fs.mkdirSync(app.getPath('userData') + '/data/file');
   }

    fs.writeFileSync(path.join(app.getPath('userData'), '/data/file', `${fileName}.${fileType}`), data);
  return path.join(app.getPath('userData'), '/data/file', `${fileName}.${fileType}`).replaceAll('\\', '/')

}


/**
 *  description: 下载文件到指定目录
 *  param {string} fileName 文件名称
 *  param {string} fileType 文件格式
 *  author: longyunfei
 */
export function downloadFileToFolderNode(  request,  fs,join, url, fileName, fileType) {
    //设置保存路径
    const targetFolder = join(app.getPath('userData'), '/download', `${fileName}.${fileType}`);
    //创建可写流
    let stream = fs.createWriteStream(targetFolder);
    request({
        url: url,
        method: 'GET'
    })
        .pipe(stream)
        .on('close', (err, response, body) => {
            stream.close();
           // if(err) return
           // shell.openPath(join(targetFolder, `${fileName}.${fileType}`)) //打开文件
        });
}


// 生成随机hash值
export function getRandomHash() {
    const current_date = (new Date()).valueOf().toString();
    const random = Math.random().toString(36).substr(2);
 const hash = crypto.randomBytes(20).toString('hex');
 //const hash2 = crypto.createHash('sha1').update(current_date + random).digest('hex');
  console.log( hash, 76);
 return hash;
}

// 计算文件hash值
export function getFileHash(stream) {

  const hash = crypto.createHash('md5');
  hash.update(stream, 'utf8');
  const md5 = hash.digest('hex');
  console.log(md5, 'md5');
  return md5;
}

// 计算字符串hash值
export function getHash(string) {

  const hash = crypto.createHash('md5');
  hash.update(string, 'utf8');
  const md5 = hash.digest('hex');
  console.log(md5, 'md5');
  return md5;
}



