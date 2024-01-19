// 下载插件


// 下载quickLook

import {serviceAxios} from "../api/http";
import {createDir, getDownLoadUrl} from "./index";
import path from "path";
import fs from "fs";
import xml2js from 'xml2js';

const service = new serviceAxios('https://gitee.com', true);

export    function downloadQuickLook() {
  if(process.platform !== 'win32') return;
  if (fs.existsSync(global.pluginDir('quickLook'))){
    return;
  }


  service.get('/dimao/cdm-clipboard/releases/download/cdm_clipboard/quickLook.zip', {
    params: {},
    responseType: 'arraybuffer',
    onDownloadProgress: (ev) => {
      console.log(ev, 15);
    }
  }).then(res => {
    // console.log(res, 20);
     createDir(global.pluginDir());
     fs.writeFileSync(global.pluginDir(`quickLook.zip`), res);
     const url = global.pluginDir(`quickLook.zip`);
     const AdmZip = require('adm-zip');

     const file = new AdmZip(url);
     const unzipRes = file.extractAllTo(path.dirname(url) + '\\quickLook');

  }).catch(res => {
    // console.log(res, 29);
   })

}

export  function downloadIcon() {
 // console.log(fs.existsSync(global.iconDir()), 33);
  if (fs.existsSync(global.iconDir())){
    return;
  }

   service.get('/dimao/cdm-clipboard/releases/download/cdm_clipboard/icon.zip', {
    params: {},
    responseType: 'arraybuffer',
    onDownloadProgress: (ev) => {
       console.log(ev, 54);
    }
  }).then(res => {
     //console.log(res, 47);
     createDir(global.tempDir());
     fs.writeFileSync(global.tempDir(`icon.zip`), res);
     const url = global.tempDir(`icon.zip`);
     const AdmZip = require('adm-zip');

     const file = new AdmZip(url);
     const unzipRes = file.extractAllTo(global.iconDir());

  }, error => {
    // console.log(error, 57);
   }).catch(res => {
    // console.log(res, 62);
   })

}





