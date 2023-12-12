// 引入模块
import log from 'electron-log';

// 关闭控制台打印
log.transports.console.level = false
log.transports.file.level = 'debug'
log.transports.file.maxSize = 10024300 // 文件最大不超过 10M
// 输出格式
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}'
let date = new Date()
let dateStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
// 文件位置及命名方式
// 默认位置为：C:\Users\[user]\AppData\Roaming\[appname]\electron_log\
// 文件名为：年-月-日.log
// 自定义文件保存位置为安装目录下 \log\年-月-日.log
log.transports.file.resolvePath = () => 'log\\' + dateStr+ '.log';

// 有六个日志级别error, warn, info, verbose, debug, silly。默认是silly
export default {
  info(param) {
    log.info(param)
  },
  warn(param) {
    log.warn(param)
  },
  error(param) {
    log.error(param)
  },
  debug(param) {
    log.debug(param)
  },
  verbose(param) {
    log.verbose(param)
  },
  silly(param) {
    log.silly(param)
  }
}
