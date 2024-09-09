var Database = require('better-sqlite3');
const enc = new TextEncoder();


var db = new Database("./data.db");

//turn on secure deleting
db.exec(`PRAGMA secure_delete = ON;`)
//enforce secure deleting
db.exec(`PRAGMA journal_mode = DELETE;`)

//create tables "IF NOT EXISTS"
db.exec(`
  create table IF NOT EXISTS quick_auths (
    key text not null PRIMARY KEY,
    password_hash blob not null,
    secret text not null,
    failed_tries INTEGER not null,
    expire_time INTEGER not null,
    max_failed_tries INTEGER not null,
    last_success_date INTEGER not null
  );
`)



async function tryUpdateEntry (key,secret,password,expireTime,maxTries) {
 
  var passwordHash = await hashString(password);

  return db.prepare(`UPDATE quick_auths SET secret = ?, password_hash = ?, expire_time = ?, max_failed_tries = ? WHERE key = ?`).run(secret,passwordHash,expireTime,maxTries,key);
    

}

async function hashString(password) {
  
  var result = await crypto.subtle.digest("SHA-256", enc.encode(password))

  return new Uint8Array(result)

}


async function generateRandomTextKey(length) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let key = "";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    key += chars[array[i] % chars.length];
  }
  return key;
}

async function createEntry (secret,password,expireTime,maxTries) {
  var passwordHash = await hashString(password);

  var key = Date.now() + "-" + await generateRandomTextKey(24)


  db.prepare("INSERT INTO quick_auths (key, password_hash, secret, failed_tries, last_success_date,expire_time, max_failed_tries) VALUES (?, ?, ?, 0, strftime('%s','now'), ?, ?)").run(key,passwordHash,secret,expireTime,maxTries);
  return key
}

async function tryDeleteEntry (key) {
  return db.prepare(`DELETE FROM quick_auths WHERE key = ?`).run(key);
}

async function tryGetSecret (key,password) {
  var passwordHash = await hashString(password);

  let res = (db.prepare("SELECT secret FROM quick_auths WHERE key = ? AND password_hash = ? AND failed_tries < max_failed_tries AND last_success_date - expire_time < strftime('%s','now')").pluck().get(key,passwordHash));
  if(res)
    db.prepare("UPDATE quick_auths SET last_success_date = strftime('%s','now') WHERE key = ?").run(key);
  else
    db.prepare("UPDATE quick_auths SET failed_tries = failed_tries + 1 WHERE key = ?").run(key);

  return res;
}




module.exports = {tryUpdateEntry, createEntry, tryDeleteEntry, tryGetSecret}