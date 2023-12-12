import   {Menu, Tray } from 'electron'




export function trayInit() {

    let tray: any = null;
    const iconPath =  'resources/icon.ico';
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '退出',
            click: function () {
                // 退出
                global.app.quit();
            }
        }
    ]);
    tray.setToolTip('这是一个托盘');
    tray.setContextMenu(contextMenu);
}