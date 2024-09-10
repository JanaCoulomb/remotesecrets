var Database = require('better-sqlite3');


var db = new Database("./data.db");

//turn on secure deleting
db.exec(`PRAGMA secure_delete = ON;`)
//enforce secure deleting
db.exec(`PRAGMA journal_mode = DELETE;`)


//create tables "IF NOT EXISTS"
db.exec(`

  create table IF NOT EXISTS entries (
    entry_key text not null PRIMARY KEY,
    entry_password_hash blob not null,
    entry_secret text not null,
    entry_failed_tries INTEGER not null,
    entry_expire_time INTEGER not null,
    entry_max_failed_tries INTEGER not null,
    entry_last_success_date INTEGER not null
  );
 
`)



async function updateEntryPassword (key,passwordHash) {
  return db.prepare(`UPDATE entries SET entry_password_hash = ? WHERE entry_key = ?`).run(passwordHash,key);
}


async function createEntry (key, secret,passwordHash,expireTime,maxTries,currentTime) {
  return db.prepare("INSERT INTO entries (entry_key, entry_password_hash, entry_secret, entry_failed_tries, entry_last_success_date,entry_expire_time, entry_max_failed_tries) VALUES (?, ?, ?, 0, ?, ?, ?)").run(key,passwordHash,secret,currentTime,expireTime,maxTries);
}

async function deleteEntry (key) {
  return db.prepare(`DELETE FROM entries WHERE entry_key = ?`).run(key);
}

async function getEntry (key) {
  return db.prepare("SELECT * FROM entries WHERE entry_key = ?").get(key);
}


async function resetEntryFailedTriesAndTime (key,time) {
  return db.prepare("UPDATE entries SET entry_last_success_date = ?, entry_failed_tries = 0 WHERE entry_key = ?").run(time,key);
}

async function incrementEntryFailedTries (key) {

  return db.prepare("UPDATE entries SET entry_failed_tries = entry_failed_tries + 1 WHERE entry_key = ?").run(key);
}


module.exports = {updateEntryPassword, createEntry, deleteEntry, getEntry,resetEntryFailedTriesAndTime,incrementEntryFailedTries}