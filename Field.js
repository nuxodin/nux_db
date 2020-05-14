
class Field {
    constructor(table, name) {
        this.name = name;
        this.table = table;
    }
    // async isPrimary(){
    //     const primaries = await this.table.primaries();
    //     return primaries.includes(this);
    // }
}

export default Field;
