
//import  remote from '@electron/remote';

import machineId from "node-machine-id";

/**
 *  description: 下载文件到指定目录
 *  param {string} url 文件下载链接
 *  param {string} fileName 文件名称
 *  param {string} fileType 文件格式
 *  author: longyunfei
 */
const fs = require('fs')
const path = require('path')
import { BrowserWindow  } from 'electron'
import crypto from 'crypto';
//将流转换为下载地址
export function  getDownLoadUrl(fileName, fileType, data) {
  createDir(global.fileDir())

    fs.writeFileSync(global.fileDir(`${fileName}.${fileType}`), data);
  return global.fileDir(`${fileName}.${fileType}`)

}


export function  getDownLoadIcon(fileName, fileType = 'png', data) {
  createDir(global.iconDir())

    fs.writeFileSync(global.iconDir(`${fileName}.${fileType}`), data);
  return global.iconDir(`${fileName}.${fileType}`)

}



// 将文件复制到缓存目录
export function copyFileToCache(oldPath, newPath) {
  console.log(oldPath, newPath, 56);
  createDir(global.fileDir())
  if (!fs.existsSync(newPath)) {
    return fs.copyFile(oldPath, newPath, () => {
      console.log('复制成功');
    });
  }
  return false;

}



export function downloadFileToFolderNode(  request,  fs,join, url, fileName, fileType) {
    //设置保存路径
    const targetFolder = join(path.dirname(process.execPath), '\\download', `${fileName}.${fileType}`);
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

// 生成设备唯一id
export function getDeviceId() {
  // 生成设备唯一id，存储本设备缓存路径
  const machineId = require('node-machine-id');
  return machineId.machineIdSync({original: true});

}

// 创建目录
export function createDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true});
  }

}

//字符串高亮

export function highlight(str, keyword) {
  const regex = new RegExp(keyword, 'gi');
  return str.replace(regex, `<span class="text-[#ff5500]">${keyword}</span>`);
}
