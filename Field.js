
class Field {
    constructor(table, name) {
        this.table = table;
        this.name = name;
    }
    // async isPrimary(){
    //     const primaries = await this.table.primaries();
    //     return primaries.includes(this);
    // }
}

export default Field;
