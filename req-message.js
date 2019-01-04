'use strict';
const zmq = require('zmq'), requester = zmq.socket('req');

requester.on("message", function(data) {
    let response = JSON.parse(data);
    console.log(response);
    console.log("Response from service : " + response.service + ', message : ' + response.message);
});

requester.connect("tcp://localhost:5433");

console.log('Sending request for time.');
while(true) {
    requester.send(JSON.stringify({
        service: process.pid,
        message: "message sent..."
    }));
}