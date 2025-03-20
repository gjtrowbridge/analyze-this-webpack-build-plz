import Database from 'better-sqlite3'

const databasePath = './sqlite/db.sqlite'
export const db = new Database(databasePath);
db.pragma('journal_mode = WAL');
