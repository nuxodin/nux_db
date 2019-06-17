
import Row from './Row.js';
import Field from './Field.js';

const Table = class {
    constructor(db, name){
        this.db = db;
        this.name = name;
        this._rows = {};
        this._fields = {};

        return new Proxy(this,{ // suger baby!
            get(target, name, receiver) {
                if (name[0] === '$') return target.row(name.substr(1));
                return Reflect.get(target, name, receiver);
            },
            set(target, name, value, receiver) {
                return Reflect.set(target, name, value, receiver);
            }
        });
    }
    row(eid) {
        //var useClass = Row.class[this.name] || Row;
        var useClass = this.rowClass || Row; // better, something like this?
        if (!this._rows[eid]) this._rows[eid] = new useClass(this, eid);
        return this._rows[eid];
    }
    async rows(filter) {
        /* todo!:
        var where = await this.objectToWhere(filter);
        this.db.query("SELECT * FROM "+this.name+" WHERE " + where);
        let all = await this.db.query("SELECT * FROM "+this.name+" WHERE " + wheres.join(' AND ')); // todo select only primaries
        let rows = [];
        for (let data of all) {
            let id = await this.rowId(data);
            var row = this.row(id);
            for (var i in data) {
                row.cell(i).P_value = Promise.resolve(data[i]); // set silent
            }
            rows.push(row);
        }
        return rows;
        */


        let wheres = [];
        for (let key in filter) {
            wheres.push(key+' = '+this.db.quote(filter[key]));
        }
        let all = await this.db.query("SELECT * FROM "+this.name+" WHERE " + wheres.join(' AND ')); // todo select only primaries
        let rows = [];
        for (let data of all) {
            let id = await this.rowId(data);
            rows.push( this.row(id) );
        }
        return rows;
    }
    field(name) {
        if (!this._fields[name]) this._fields[name] = new Field(this, name);
        return this._fields[name];
    }
    async fields(){
        if (!this.a_fields) {
            var all = await this.db.query("SHOW FIELDS FROM " + this);
            this.a_fields = [];
            this.a_primaries = [];
            all.forEach(values=>{
                const name = values['Field'];
                const field = new Field(this, name);
                this._fields[name] = field;
                this.a_fields.push(field);
                if (values['Key'] === 'PRI') this.a_primaries.push(field);
                if (values['Extra'] === 'auto_increment') this._autoincrement = field;
            });
        }
        return this.a_fields;
    }
    async primaries(){
        await this.fields();
        return this.a_primaries;
    }
    async autoincrement(){
        await this.fields();
        return this._autoincrement;
    }

    async rowId(array){
        if ({string:1,number:1}[typeof array]) return array;
        return (await this.primaries()).map(field=>{
            //if (field instanceof Row) { ... }
            if (array[field.name] === undefined) throw('entryId: property "'+this+'.'+field.name+'" not present');
            return array[field.name];
        }).join('-:-');
    }
    async rowIdObject(id){
        const isObject = !{string:1,number:1}[typeof id];
        const object = Object.create(null);
        const primaries = await this.primaries();
        if (isObject) { // make a new object, or better return id direct?
            for (let field of primaries) {
                if (id[field.name] === undefined) throw('rowIdObject: property "'+this+'.'+field.name+'" not present');
                object[field.name] = id[field.name];
            }
        } else {
            const values = (id+'').split('-:-');
            for (let field of primaries) {
                let value = values.shift();
                if (value === undefined) throw('rowIdObject: property "'+this+'.'+field.name+'" not present');
                object[field.name] = value;
            }
        }
        return object;
    }
    async rowIdToWhere(id){
        const obj = await this.rowIdObject(id);
        return await this.objectToWhere(obj);
    }
    async _objectToSqls(object, alias=null, isSet=false) {
        const sqls = [];
        const fields = await this.fields();
        for (let field of fields) {
            if (object[field.name] === undefined) continue;
            //let sqlValue = field.valueToSql(object[field.name]);
            let sqlValue = this.db.quote(object[field.name]);
            let sqlField = (alias?alias+'.':'') + field.name;
			let equal = ' = ';
			//let equal = (!isSet && sqlValue==='NULL'?' IS ':' = ');
			sqls.push(sqlField + equal + sqlValue);
        }
        return sqls;
    }

	async objectToWhere(data, alias=null) {
        const sqls = await this._objectToSqls(data, alias);
        return sqls.join(' AND ');
	}
	async objectToSet(data, alias=null) {
        const sqls = await this._objectToSqls(data, alias, true);
        return sqls.join(' , ');
	}




    async insert(data){

        // todo intervention
        // event = {
        //     _waitingPromises:[],
        //     data
        // };
        // event.waitUntil = function(promise){
        //     this._waitingPromises.push(promise);
        // }
        // this.trigger('insert-before',event)
        // async Promise.all(event._waitingPromises);

        const set = await this.objectToSet(data);
        const Statement = await this.db.query("INSERT INTO " + this + (set ? " SET "+set : " () values () "));
        if (!Statement.affectedRows) return false;
        let auto = await this.autoincrement();
        if (auto) {
            data[auto.name] = Statement.insertId;
        }
        const rowId = await this.rowId(data);
        //this.trigger('insert-after',data);
        return this.row(rowId);
        //return id;
    }
    toString() {
        return this.name;
    }
};

export default Table;
