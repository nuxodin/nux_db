
class Cell {
    constructor(row, name) {
        this.row = row;
        this.name = name;
    }
    get value() {
        return this.getValue();
        if (this.P_value === undefined) {
            this.P_value = this.row.table.rowIdToWhere(this.row.eid).then(where=>{
                return this.row.table.db.one("SELECT "+this.name+" FROM "+this.row.table+" WHERE "+where+" ");
            });
        }
        return this.P_value;
    }
    set value(value) {
        return this.setValue(value);
        var promi = this.P_value = this.row.table.rowIdToWhere(this.row.eid).then(where=>{
            return this.row.table.db.query("UPDATE "+this.row.table+" SET "+this.name+" = "+this.row.table.db.quote(value)+" WHERE "+where+" ");
        });
        this.P_value = Promise.resolve(value);
        return promi;
    }


    async getValue() {
        if (this._value === undefined) {
            const where = await this.row.table.rowIdToWhere(this.row.eid);
            this._value = await this.row.table.db.one("SELECT "+this.name+" FROM "+this.row.table+" WHERE "+where+" ");
        }
        return this._value;
    }

    async setValue(value){
        //this._value = value; // for now it has to refetch value
        this._value = undefined;
        await this.row.set({[this.name]:value});
    }


}

export default Cell;
