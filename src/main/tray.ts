import {BrowserWindow, Menu, Tray, nativeImage, ipcMain, dialog} from 'electron'
import {join, dirname} from "path";
import {is} from "@electron-toolkit/utils";
import CreateSettingWindow from './setting.js';
import {handleRestart, handleSetting} from './common/index.js';

export function trayInit() {

    let tray: any = null;
    let iconPath =  'resources/icon.png';

  iconPath = join(__dirname,'resources/icon.png');
  nativeImage.createFromPath(iconPath);
  if (is.dev) {
    // 测试环境
    iconPath = join(global.app.getAppPath(), 'resources/icon.png');
    console.log(join(global.app.getAppPath(), 'resources/icon.png'));
  }else {
    // 正式环境
    iconPath = join(dirname(global.app.getPath('exe')), 'resources/app.asar.unpacked/resources/icon.png');
  }



    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '设置',
        click: handleSetting
      },
        {
            label: '重启',
            click: handleRestart
        },{
            label: '退出',
            click: function () {
                // 退出
                global.app.quit();
            }
        },


    ]);

  tray.on('click', () => {
    if (BrowserWindow.fromId(global.mainId)) {
      BrowserWindow.fromId(global.mainId).restore()
      BrowserWindow.fromId(global.mainId).show()
      BrowserWindow.fromId(global.mainId).setSkipTaskbar(false)
    }
  })



    tray.setToolTip('云同步剪切板');
    tray.setContextMenu(contextMenu);
}
