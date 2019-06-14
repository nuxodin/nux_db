class dbCell {
    constructor(row, name) {
        this.row = row;
        this.name = name;
    }
    get value() {
        if (this.P_value === undefined) {
            this.P_value = this.row.table.rowIdToWhere(this.row.eid).then(where=>{
                return this.row.table.db.one("SELECT "+this.name+" FROM "+this.row.table+" WHERE "+where+" "); // return not needed
            });
        }
        return this.P_value;
    }
    set value(value) {
        var promi = this.P_value = this.row.table.rowIdToWhere(this.row.eid).then(where=>{
            return this.row.table.db.query("UPDATE "+this.row.table+" SET "+this.name+" = "+value+" WHERE "+where+" ");
        });
        this.P_value = Promise.resolve(value);
        return promi;
    }
}

export default dbCell;
