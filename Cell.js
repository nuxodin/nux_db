
class Cell {
    constructor(row, name) {
        this.row = row;
        this.name = name;
    }
    get value() {
        return this.getValue();
    }
    set value(value) {
        this.setValue(value);
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
