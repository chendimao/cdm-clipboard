import Database from 'better-sqlite3';
import path, {dirname, join} from "path";
import fs from "fs";
import {app} from "electron";
import {createDir} from "./index";
import dayjs from 'dayjs';
export function initDB(options = {}) {


  createDir(global.dbDir())


  const db = new Database(global.dbDir(`clipboard.db`), options);
  global.db = db;
  try {
    console.log('created');
      db.exec(
        `CREATE TABLE IF NOT EXISTS Clipboard (
        id    integer primary	 key AUTOINCREMENT,
        text  text,
        html text,
        rtf  text,
        type char(4),
        hash varchar(32) NOT NULL,
          top  integer,
            topTime varchar,
          collect  integer,
          collectTime  varchar,
        syncTime varchar,
        syncStatus int,
        time varchar)`
      );

      // 创建索引
    // 判断索引是否存在
    const isIndexRes = db.prepare(`select count(name) as num from sqlite_master where name = 'index_hash'`).get();
    console.log(isIndexRes);
    if (isIndexRes?.num == 0) {
      const index_sql = `
    CREATE UNIQUE INDEX index_hash
    on Clipboard (hash);
            `;
      db.prepare(index_sql).run();
    }



  } catch (error) {
    console.log(error);
    if (error.message == "table Clipboard already exists") {
      console.log("Clipboard表已经存在");
    }
  }
  try {
    console.log('created cache');
    db.exec(
        `CREATE TABLE IF NOT EXISTS Cache (
        id    integer primary	 key AUTOINCREMENT,
        hash varchar(32),
        drive varchar,
          img varchar,
          file varchar,
          cache varchar,
        size varchar,
        info  varchar,
          syncTime varchar,
          syncStatus int,
          type  char(8),
          time varchar)`
      );



  } catch (error) {
    console.log(error);
    if (error.message == "table Cache already exists") {
      console.log("Cache表已经存在");
    }
  }

  try {
    console.log('created config');
    db.exec(
        `CREATE TABLE IF NOT EXISTS Config (
        id    integer primary	 key AUTOINCREMENT,
        autoStart integer DEFAULT 1, -- 开机自启动 1 自启动 0 不自启动
        maxCount integer DEFAULT 0, -- 最大缓存数量 0为不限制
        expiredTime integer DEFAULT 0, --  缓存过期时间 单位天 0为不限制
        isFile integer DEFAULT 1, --
        fileSize integer DEFAULT 100,  -- 记录文件上限大小 单位MB
        isCacheFile integer DEFAULT 1, -- 缓存方式   0 云端本地缓存 1 仅本地缓存 2 云端缓存 3 不缓存
        isDeleteFile integer DEFAULT 0, -- 删除文件方式   0 只删除缓存文件 1 只删除源文件 2 删除缓存及源文件 3 不删除
        isNotice  integer DEFAULT 1, -- 是否开启通知 1 开启 0 不开启
        isWebdav integer DEFAULT 0, -- 是否开启Webdav 1 开启 0 不开启
        webdavUrl varchar, -- Webdav地址
        webdavUser varchar, -- Webdav用户名
        webdavPass varchar, -- Webdav密码
        webdavPath varchar, -- Webdav路径
        bigTextToFile int DEFAULT 1, -- 是否将长文本转换为文件 1 转换 0 不转换
        textSize integer DEFAULT 100, -- 转换文件上限大小 单位KB
        dataPath  varchar DEFAULT '${global.dataDir()}', -- 数据缓存地址
        isMini integer DEFAULT 0, -- 是否迷你模式 0 正常模式 1 迷你模式
        isOffset  integer DEFAULT 0, -- 定位模式 0 居中靠右对齐 1 居中对齐 2 相对鼠标位置对齐
        isDoubKey integer DEFAULT 0, -- 是否使用双击单键激活程序 0 否 1 是
        k0 varchar DEFAULT  'Alt+Q', -- 快捷键 激活程序
        k1 varchar DEFAULT  'Alt+1', -- 快捷键1
        k2 varchar DEFAULT  'Alt+2', -- 快捷键2
        k3 varchar DEFAULT  'Alt+3', -- 快捷键3
        k4 varchar DEFAULT  'Alt+4', -- 快捷键4
        k5 varchar DEFAULT  'Alt+5', -- 快捷键5
        k6 varchar DEFAULT  'Alt+6', -- 快捷键6
        k7 varchar DEFAULT  'Alt+7', -- 快捷键7
        k8 varchar DEFAULT  'Alt+8', -- 快捷键8
        k9 varchar DEFAULT  'Alt+9', -- 快捷键9
        k10 varchar DEFAULT 'CommandOrControl+1', -- 快捷键10
        k11 varchar DEFAULT 'CommandOrControl+2', -- 快捷键11
        k12 varchar DEFAULT 'CommandOrControl+3', -- 快捷键12
        k13 varchar DEFAULT 'CommandOrControl+4', -- 快捷键13
        k14 varchar DEFAULT 'CommandOrControl+5', -- 快捷键14
        k15 varchar DEFAULT 'CommandOrControl+6', -- 快捷键15
        b1 varchar DEFAULT 'Alt', -- 双击激活程序
        b2 varchar DEFAULT 'Shift+F1', -- 选中项目菜单1
        b3 varchar DEFAULT 'Shift+F2', -- 选中项目菜单2
        b4 varchar DEFAULT 'Shift+F3', -- 选中项目菜单3
        b5 varchar DEFAULT 'Shift+F4', -- 选中项目菜单4
        b6 varchar DEFAULT 'Shift+F5', -- 选中项目菜单5
        b7 varchar DEFAULT '', -- 备用字段
        b8 varchar DEFAULT '', -- 备用字段
        b9 varchar DEFAULT '', -- 备用字段
        b10 varchar DEFAULT '', -- 备用字段
        b11 varchar DEFAULT '', -- 备用字段
        b12 varchar DEFAULT '', -- 备用字段
        b13 varchar DEFAULT '', -- 备用字段
        b14 varchar DEFAULT '', -- 备用字段
        b15 varchar DEFAULT '', -- 备用字段
        b16 varchar DEFAULT '', -- 备用字段
        b17 varchar DEFAULT '', -- 备用字段
        b18 varchar DEFAULT '', -- 备用字段
        b19 varchar DEFAULT '', -- 备用字段
        b20 varchar DEFAULT '', -- 备用字段
        b21 varchar DEFAULT '', -- 备用字段
        b22 varchar DEFAULT '', -- 备用字段
        b23 varchar DEFAULT '', -- 备用字段
        b24 varchar DEFAULT '', -- 备用字段
        b25 varchar DEFAULT '', -- 备用字段
        b26 varchar DEFAULT '', -- 备用字段
        b27 varchar DEFAULT '', -- 备用字段
        b28 varchar DEFAULT '', -- 备用字段
        b29 varchar DEFAULT '', -- 备用字段
        b30 varchar DEFAULT '', -- 备用字段

        info  varchar, -- 其他信息
          time varchar -- 修改时间
                                  )`
      );
    const res = getConfig();

    if (!res) {
      const sql = `insert into Config (autoStart, maxCount, expiredTime, isFile, fileSize, info, time,isNotice, isWebdav,webdavUrl,webdavUser,webdavPass,webdavPath, bigTextToFile, textSize, isCacheFile, isMini, isOffset)
                values(1, 0, 0, 1, 100, '', '${dayjs().format('YYYY-MM-DD HH:mm:ss')}', 1, 0, '', '', '', '', 1, 100, 1, 0, 0);`;
    //  console.log(sql, 93);
      const r = db.prepare(sql).run();
    }


  } catch (error) {
    console.log(error);
    if (error.message == "table Config already exists") {
      console.log("Config表已经存在");
    }
  }

  // 获取配置设置为全局变量
  getConfig();
  getClipboardCount();
  // 删除过期数据
  deleteExpireData();


}

// 插入数据
export function insertDB(data) {


  let dataKey = '';
  let dataValue = '';
  Object.keys(data).forEach(key => {
    dataKey += `${key},`
    dataValue += `@${key},`
  })
  dataKey = dataKey.slice(0, -1);
  dataValue = dataValue.slice(0, -1);
  const sql  = `INSERT INTO Clipboard (${dataKey}) VALUES (${dataValue});`;
  //console.log(sql, 121);
  const insert = global.db.prepare(
    sql
  );
   const res = insert.run(data);
   global.clipboardCount += 1;


  return res;
  // const insertMany = this.db.transaction((cats) => {
  //   for (const cat of cats) {
  //     insert.run(cat);
  //   }
  // });
  //insertMany(arr_photo_path);

}


//  根据hash查询单条数据
export function getDB(hash) {

  const sqlJoin= '  LEFT OUTER JOIN Cache ON Cache.hash = Clipboard.hash';

  const sql = `select *,Clipboard.hash,Clipboard.type, GROUP_CONCAT(Cache.size, '??::') as size,  GROUP_CONCAT(Cache.info, '??::') as info,  GROUP_CONCAT(Cache.cache, '??::') as cache  from Clipboard   ${sqlJoin} where Clipboard.hash = '${hash}'   GROUP BY Clipboard.hash;`;

  const stmt = global.db.prepare(
     sql
  );
  return stmt.get();
}

//  查询数据集合
export function getDbList(data, keyword, type, limit, offset, opt = 'ORDER BY time DESC') {
  const keys = Object.keys(data);
  let sqlParams = '';
  // 左连接查询cache表
 const sqlJoin= '  LEFT OUTER JOIN Cache ON Cache.hash = Clipboard.hash ';
  const limitStr = ` limit ${limit} offset ${offset} `;
  //拼接查询条件
  // for (let i = 0; i < keys.length; i++) {
  //   sqlParams += `Clipboard.${keys[i]} = '${data[keys[i]]}' `;
  //   if (i != keys.length - 1) sqlParams += ' AND ';
  // }

  if (keyword) {
    sqlParams += `  where  (text like '%${keyword}%' or Cache.img like '%${keyword}%'  or Cache.file like '%${keyword}%'  or Cache.cache like '%${keyword}%')  `;
  }

  // if (type) {
  //
  //   sqlParams +=keyword ?  ` ${type ? ' and (Cache.img like %' + type + '% or' + 'Cache.file like %' + type + '%' + '% or' + 'Cache.cache like %' + type + '%' + ') ': ''} ` : ` where Clipboard.type = '${type}'`;
  // }



  //const sql = `select *, ${table}.hash from ${table} ${sqlJoin} where ${sqlParams} ${opt};`;
  const sql2= `select *,Clipboard.hash,Clipboard.type, GROUP_CONCAT(Cache.size, '??::') as size,  GROUP_CONCAT(Cache.info, '??::') as info,  GROUP_CONCAT(Cache.file, '??::') as file,  GROUP_CONCAT(Cache.cache, '??::') as cache  from Clipboard   ${sqlJoin}    ${sqlParams} GROUP BY Clipboard.hash ORDER BY Clipboard.time DESC  ${limitStr}  ;`;
  // console.log(sql2, 120);
  const stmt = global.db.prepare(sql2);
  //console.log(stmt.all());
  return stmt.all();

}



// 更新数据
export function updateDB(table, data, hash) {

  let dataStr = '';
  let dataSql = '';
  Object.keys(data).forEach(key => {
    dataSql += `${key} = ?` +   ','
    dataStr += `${data[key]}` +   ','
  })
  dataSql = dataSql.slice(0, -1);
  dataStr = dataStr.slice(0, -1);
  const sql = `update ${table} set ${dataSql} where hash=?;`;
  const update = global.db.prepare(
    sql
  );
 // console.log(sql, 'update');
 return update.run(dataStr, hash);
}

// 删除数据
export function deleteDB(table, hash) {

  const sql = `delete from ${table} where hash=?;`;
  const deleteData = global.db.prepare(
    sql
  );
 // console.log(sql)
  return deleteData.run(hash);
}

// 执行sql
export function execQuerySql(sql) {
   const stmt = global.db.prepare(sql);
  //console.log(sql, 'exec');
  return stmt.all();
}
export function execUpdateSql(sql) {
 // console.log(sql);
   const stmt = global.db.prepare(sql);
  //console.log(sql);
  return stmt.run();
}

// 执行insert sql事务
export function execInsertSqlTransaction(table, data) {

  const keysStr = Object.keys(data[0]).join(',');

  const valsStr = Object.keys(data[0]).map(key => '@' + key ).join(',');

  const sql = `INSERT INTO ${table} (${keysStr}) VALUES (${valsStr})`;
  const insert = db.prepare(sql);
  //console.log(sql, 234);
  const insertData = db.transaction((data) => {
    for (const d of data) insert.run(d);
  });
  const res = insertData(data);

}


export  function getConfig() {

  const sql = `select *  from Config`;

  const stmt = global.db.prepare(
    sql
  );


  const res = stmt.get();
  global.Config = res;
  return res;
}



// 更新数据
export function updateDBId(table, data, id) {
  let dataSql = '';
  console.log(data,id, 277);
  Object.keys(data).forEach(key => {

    dataSql += `${key} = '${ data[key]  }' ,`
  })
  dataSql = dataSql.slice(0, -1);

  const sql = `update ${table} set ${dataSql} where id = ${id};`;
  //const sql = `update Config set maxCount = '${data.maxCount}' where id= 1;`;
  //console.log(sql);
  const update = global.db.prepare(
    sql
  );
  // console.log(sql, 'update');
  return update.run();
}

// 获取Clipboard表条数
export function getClipboardCount() {

   const sql = `select count(hash) as count from Clipboard`;
  const stmt = global.db.prepare(
    sql
  );
  const res = stmt.get().count;
  global.clipboardCount = res;
  return res;
}

// 删除过期数据
export function deleteExpireData() {
  console.log(global.Config.expiredTime, 351);
  if(global.Config.expiredTime == 0) return;


  const expireDate = dayjs().subtract(global.Config.expiredTime, 'days').format('YYYY-MM-DD HH:mm:ss')
  //const expireDate = '2024-01-03 11:56:30';

  const sql = `delete from Clipboard where time < '${expireDate}';`;
  const sql2 = `delete from Cache where time < '${expireDate}';`;
  const res = global.db.prepare(sql).run();
  const res2 = global.db.prepare(sql2).run();
  console.log(expireDate, res, res2, 361);
}











