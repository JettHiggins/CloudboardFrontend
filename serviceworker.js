const serverurl = "http://127.0.0.1:8080";
self.addEventListener('fetch', (event) =>{
	if (event.request.method == "POST"){
		if (event.request.url == serverurl + "/api/login-status"){
			console.log("Login Status Request");
		}
		if (event.request.url == serverurl + "/login"){
i			console.log("Login Request");
		}
	}
});
