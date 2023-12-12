import Database from 'better-sqlite3';
import {join} from "path";
import fs from "fs";
import {app} from "electron";

export function initDB(options = {}) {

  if (!fs.existsSync(app.getPath('userData') + '/data')) {
    fs.mkdirSync(app.getPath('userData') + '/data');
  }

  if (!fs.existsSync(app.getPath('userData') + '/data/db')) {
    fs.mkdirSync(app.getPath('userData') + '/data/db');
  }

  const db = new Database(join(app.getPath('userData'), '/data/db', `clipboard.db`), options);
  try {
    console.log('created');
      db.exec(
        `CREATE TABLE IF NOT EXISTS Clipboard (
        id    integer primary	 key AUTOINCREMENT,
        text  text,
        html text,
        rtf  text,
        img text,
        file varchar,
        cache varchar,
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
        cache varchar,
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
    `INSERT INTO Clipboard (text, html, rtf, img, file, cache, hash, syncTime, syncStatus, time) ` +
    "VALUES (@text, @html, @rtf, @img, @file, @cache, @hash, @syncTime, @syncStatus, @time)"
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
  const insert = global.db.prepare(
    `INSERT INTO Clipboard ( hash,drive, cache, time) ` +
    "VALUES ( @hash,@drive, @cache,  @time)"
  );
  return insert.run(data);

  // const insertMany = this.db.transaction((cats) => {
  //   for (const cat of cats) {
  //     insert.run(cat);
  //   }
  // });
  //insertMany(arr_photo_path);

}

//  查询hash数据
export function getDB(table, hash) {
  const stmt = global.db.prepare(
    `select * from ${table} where hash='${hash}';`
  );
  return stmt.get();
}

//  查询数据集合
export function getDbList(table, data) {


  let dataStr = '';
  Object.keys(data).forEach(key => {
    dataStr += `${key}` +   '=' + `'${data[key]}'` +   ','

  })

  dataStr = dataStr.slice(0, -1);
  const stmt = global.db.prepare(
    `select * from ${table} where ${dataStr} ORDER BY time DESC;`
  );
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
  const update = global.db.prepare(
    `update ${table} set ${dataSql} where hash=?;`
  );
 return update.run(dataStr, hash);
}

// 删除数据
export function deleteDB(table, hash) {
  const deleteData = global.db.prepare(
    `delete from ${table} where hash=?;`
  );
  return deleteData.run(hash);
}





