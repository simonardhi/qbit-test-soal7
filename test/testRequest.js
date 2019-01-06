var zmq = require('zmq');
console.log("Connecting to hello world server…");
var requester = zmq.socket('req');

requester.on("message", function(data) {
    let response = JSON.parse(data);
    console.log("Response from " + response.pid + ' : ' + response.timestamp);
});

requester.connect("tcp://127.0.0.1:3000");

console.log('Sending request for time.');
requester.send(JSON.stringify({
    service: "service1",
    message: process.pid
}));
requester.send(JSON.stringify({
    service: "service2",
    message: process.pid
}));
requester.send(JSON.stringify({
    service: "service3",
    message: process.pid
}));