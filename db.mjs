import mysql from 'mysql';
import dbTable from './dbTable.mjs';

class db {
    constructor(host, user, pass, name){
        this.conn = mysql.createConnection({
            host     : host,
            user     : user,
            password : pass,
            database : name,
        });
        this.tables = {};

        return new Proxy(this, { // suger baby!
            get(target, name, receiver) {
                if (name[0] === '$') return receiver.table(name.substr(1));
                return Reflect.get(target, name, receiver);
            },
            set(target, name, value, receiver) {
                return Reflect.set(target, name, value, receiver);
            }
        });
    }
    table(name){
        if (!this.tables[name]) this.tables[name] = new dbTable(this,name);
        return this.tables[name];
    }
    query(sql){
        return new Promise((resolve,reject)=>{
            this.conn.query(sql, function (error, results, /*fields*/) {
                if (error) reject(error);
                else resolve(results);
            });
        });
    }
    async row(sql){
        const all = await this.query(sql);
        return all && all[0];
    }
    async one(sql){
        const row = await this.row(sql);
        if (row) for (let i in row) return row[i];
    }
    quote(value){
        return this.conn.escape(value);
    }
}

export default db;
