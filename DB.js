import Table from './Table.js';

class DB {
    constructor(connection){
        this.conn = connection;
        this.tables = {};
        /*
        return new Proxy(this, { // suger baby!
            get(target, name, receiver) {
                if (name[0] === '$') return receiver.table(name.substr(1));
                return Reflect.get(target, name, receiver);
            },
            set(target, name, value, receiver) {
                return Reflect.set(target, name, value, receiver);
            }
        });
        */
    }
    table(name){
        if (!this.tables[name]) this.tables[name] = new Table(this,name);
        return this.tables[name];
    }

    /* sql */
    query(sql /*, params */){
        try {
            return this.conn.query(sql /*, params */);
        } catch(e) {
            console.log(sql, e)
            //throw e;
            return false;
        }
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
        return "'"+(value+'').replace(/'/g, "\'")+"'";
        return this.conn.escape(value);
    }
}

export default DB;
