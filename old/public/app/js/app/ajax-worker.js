self.addEventListener('message', function(e) {
	var data = e.data;
	switch (data.cmd) {
		case 'get':
			self.postMessage({'cmd' : 'started'});
			var xhr = new XMLHttpRequest();
			xhr.open("GET", data.url, false);  // synchronous request
			xhr.send(null);
			self.postMessage({'response' : xhr.responseText, 'cmd' : 'finish'});
			break;
		case 'stop':
			self.postMessage('WORKER STOPPED: ' + data.msg);
			self.close(); // Terminates the worker.
			break;
		default:
			self.postMessage('Unknown command: ' + data.msg);
	};
}, false);