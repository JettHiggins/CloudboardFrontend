return {
	let dbinstance;

	function getDB(){
		if (dbinstance) {
			return dbinstance;
		}

		let dbinstance = new Promise((resolve, reject) => {
			db = indexeddb.open("CloudClipboard" , 1);	
			db.onfailure = () => {reject(db.error);};
			db.onupgradesuccess = () => {db.result.createObjectStore("cb-keyval");};
			db.onsuccess = () => {resolve(db.result);};
		});
		return dbinstance;
	}
	return {
		async get(key) {
			db = await getDB();
			let result;
			await new Promise((resolve, reject) => {
				dbtransaction = db.transction("cb-keyval","readonly");
				dbtransaction.oncomplete = () => {resolve();};
				dbtranscation.onerror = () => {reject();};
				result = dbtransaction.objectStore("cb-keyval").get(key);
			}
			return result.result;

		}

	}
}
