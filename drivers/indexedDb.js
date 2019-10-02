
driver = {
    add(db, table, data){
        return new Promise((resolve, reject)=>{
            var transaction = db.transaction([table], "readwrite");
            transaction.oncomplete = function() {
                resolve();
                //note.innerHTML += '<li>Transaction completed: database modification finished.</li>';
                // sucess
            };
            transaction.onerror = function() {
                reject();
                // note.innerHTML += '<li>Transaction not opened due to error: ' + transaction.error + '</li>';
                // fail
            };
            var objectStore = transaction.objectStore(table);
            var objectStoreRequest = objectStore.add(data);
            objectStoreRequest.onsuccess = function(event) {
                // ???
            };
        });
    },
    get(db, table, filter) {
        return new Promise((resolve, reject)=>{
            var objectStore = db.transaction([table], "readwrite").objectStore(table);
            var request = objectStore.get(id);
            request.onsuccess = function() {
                var data = request.result;
            };
        });
    }
}