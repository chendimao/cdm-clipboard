import Database from 'better-sqlite3';
import path, {dirname, join} from "path";
import fs from "fs";
import {app} from "electron";
import {createDir} from "./index";

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
        hash varchar(32),
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
        syncTime varchar,
        syncStatus int,
        time varchar)`
      );



  } catch (error) {
    console.log(error);
    if (error.message == "table Cache already exists") {
      console.log("Cache表已经存在");
    }
  }
  global.db = db;
}

// 插入数据
export function insertDB(data) {
  const insert = global.db.prepare(
    `INSERT INTO Clipboard (text, html, rtf, type, hash, syncTime, syncStatus, time) ` +
    "VALUES (@text, @html, @rtf, @type,  @hash, @syncTime, @syncStatus, @time)"
  );
  return insert.run(data);

  // const insertMany = this.db.transaction((cats) => {
  //   for (const cat of cats) {
  //     insert.run(cat);
  //   }
  // });
  //insertMany(arr_photo_path);

}

// 插入缓存数据
export function insertCache(data) {
  const sql = `INSERT INTO Cache ( hash,drive, cache,  syncTime, syncStatus,time) ` +
    "VALUES ( @hash,@drive, @cache, @syncTime, @syncStatus, @time)";
  const insert = global.db.prepare(
    sql
  );
 // console.log(sql, 'insert');
  return insert.run(data);

  // const insertMany = this.db.transaction((cats) => {
  //   for (const cat of cats) {
  //     insert.run(cat);
  //   }
  // });
  //insertMany(arr_photo_path);

}

//  根据hash查询单条数据
export function getDB(table, hash) {

  const stmt = global.db.prepare(
    `select *, ${table}.hash from ${table}  where ${table}.hash='${hash}';`
  );
  return stmt.get();
}

//  查询数据集合
export function getDbList(table, data, opt = 'ORDER BY time DESC') {
  const keys = Object.keys(data);
  let sqlParams = '';
  // 左连接查询cache表
 const sqlJoin= '  LEFT OUTER JOIN Cache ON Cache.hash = ' + table + '.hash ';

  //拼接查询条件
  for (let i = 0; i < keys.length; i++) {
    sqlParams += ` ${table}.${keys[i]} = '${data[keys[i]]}' `;
    if (i != keys.length - 1) sqlParams += ' AND ';
  }


  //const sql = `select *, ${table}.hash from ${table} ${sqlJoin} where ${sqlParams} ${opt};`;
  const sql2= `select *,Clipboard.hash, GROUP_CONCAT(Cache.file, '??::') as file,  GROUP_CONCAT(Cache.cache, '??::') as cache  from Clipboard   ${sqlJoin}  where  ${sqlParams} GROUP BY Clipboard.hash  ORDER BY Clipboard.time DESC;`;
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

  const insertData = db.transaction((data) => {
    for (const d of data) insert.run(d);
  });
  const res = insertData(data);

}





