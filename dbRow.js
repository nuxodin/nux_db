
import dbCell from './dbCell.mjs';

class dbRow {
    constructor(table, eid){
        this.table  = table;
        this.db = table.db;
        this.eid    = eid;
        this._cells = {};

        return new Proxy(this,{ // suger baby!
            get(target, name, receiver) {
                if (name[0] === '$') return target.cell(name.substr(1)).value;
                return Reflect.get(target, name, receiver);
            },
            set(target, name, value, receiver) {
                if (name[0] === '$') {
                    target.cell(name.substr(1)).value = value;
                    return true;
                }
                return Reflect.set(target, name, value, receiver);
            }
        });
    }
    cell(name) {
        if (!this._cells[name]) this._cells[name] = new dbCell(this, name);
        return this._cells[name];
    }
    async cells() {
        if (!this.hasAllCells) { // todo, evaluate if has all
            const where = await this.table.rowIdToWhere(this.eid);
            const data = await this.db.row("SELECT * FROM "+this.table+" WHERE "+where);
            this._is = !!data;
            for (let name in data) {
                const cell = this.cell(name);
                if (cell.P_value === undefined) cell.P_value = Promise.resolve(data[name]);
            }
            this.hasAllCells = true;
        }
        return this._cells;
    }
    async values() {
        let obj = {};
        let cells = await this.cells();
        for (let name in cells) { // todo: Promise.all()
            obj[name] = await cells[name].value;
        }
        return obj;
    }
    async is() {
        if (this._is === undefined) await this.cells();
        return this._is ? this : false;
    }
    async makeIfNot() {
        let is = await this.is();
        if (!is) {
            const values = await this.table.rowIdObject(this.eid);
            return await this.table.insert(values);
        }
    }
    toString(){
        return this.eid;
    }
}

// custom classes for individual tables
dbRow.class = Object.create(null);

export default dbRow;
