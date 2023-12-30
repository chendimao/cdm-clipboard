import Database from 'better-sqlite3';
import path, {dirname, join} from "path";
import fs from "fs";
import {app} from "electron";
import {createDir} from "./index";
import dayjs from 'dayjs';
export function initDB(options = {}) {
  createDir(global.dbDir())

  const db = new Database(global.dbDir(`clipboard.db`), options);
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
        isFile integer DEFAULT 1, -- 是否记录文件 1 记录 0 不记录
        fileSize integer DEFAULT 100,  -- 记录文件上限大小 单位MB
        isCacheFile integer DEFAULT 1, -- 是否缓存文件 1 缓存 0 不缓存
        isNotice  integer DEFAULT 1, -- 是否开启通知 1 开启 0 不开启
        isWebdav integer DEFAULT 0, -- 是否开启Webdav 1 开启 0 不开启
        webdavUrl varchar, -- Webdav地址
        webdavUser varchar, -- Webdav用户名
        webdavPass varchar, -- Webdav密码
        webdavPath varchar, -- Webdav路径
        bigTextToFile int DEFAULT 0, -- 是否将长文本转换为文件 1 转换 0 不转换
        textSize integer DEFAULT 10240, -- 转换文件上限大小 单位KB
        info  varchar, -- 其他信息
          time varchar -- 修改时间
                                  )`
      );
    const res = db.prepare(`select * from Config `).get();

    if (!res) {
      const sql = `insert into Config (autoStart, maxCount, expiredTime, isFile, fileSize, info, time,isNotice, isWebdav,webdavUrl,webdavUser,webdavPass,webdavPath, bigTextToFile, textSize, isCacheFile)
                values(1, 0, 0, 1, 100, '', '${dayjs().format('YYYY-MM-DD HH:mm:ss')}', 1, 0, '', '', '', '', 0, 10240, 1);`;
    //  console.log(sql, 93);
      const r = db.prepare(sql).run();
    }


  } catch (error) {
    console.log(error);
    if (error.message == "table Config already exists") {
      console.log("Config表已经存在");
    }
  }
  global.userConfig = db.prepare(`select * from Config `).get();
  global.db = db;
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
export function getDbList(data, keyword, limit, offset, opt = 'ORDER BY time DESC') {
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
    sqlParams += `  where  text like '%${keyword}%' or Cache.img like '%${keyword}%' or Cache.file like'%${keyword}%' or Cache.cache like '%${keyword}%'`;
  }


  //const sql = `select *, ${table}.hash from ${table} ${sqlJoin} where ${sqlParams} ${opt};`;
  const sql2= `select *,Clipboard.hash,Clipboard.type, GROUP_CONCAT(Cache.size, '??::') as size,  GROUP_CONCAT(Cache.info, '??::') as info,  GROUP_CONCAT(Cache.file, '??::') as file,  GROUP_CONCAT(Cache.cache, '??::') as cache  from Clipboard   ${sqlJoin}    ${sqlParams} GROUP BY Clipboard.hash ORDER BY Clipboard.time DESC  ${limitStr}  ;`;
  console.log(sql2, 120);
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








