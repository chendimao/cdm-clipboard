// 下载插件


// 下载quickLook

import {serviceAxios} from "../api/http";
import {createDir, getDownLoadUrl} from "./index";
import path from "path";
import fs from "fs";
const compressing = require('compressing');
export    function downloadQuickLook() {
   serviceAxios({
    url: 'http://192.168.50.20:8866/share-fileManagement/QuickLook-3.7.3.zip?shareID=xv7EOXKQhI0eZf3',
    params: {},
    methods: 'get',
    responseType: 'arraybuffer',
    onDownloadProgress: (ev) => {
     // console.log(ev, 15);
    }
  }).then(res => {


     createDir(global.pluginDir());

     fs.writeFileSync(global.pluginDir(`quickLook.zip`), res);
     const url = global.pluginDir(`quickLook.zip`);


     const AdmZip = require('adm-zip');

     const file = new AdmZip(url);
     const unzipRes = file.extractAllTo(path.dirname(url) + '\\quickLook');

  })

}


