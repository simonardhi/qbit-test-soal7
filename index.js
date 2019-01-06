"use strict";

const zmq = require('zmq'),
    routerEndPoint = 'tcp://127.0.0.1:3000',
    dealerEndPoint = 'ipc://dealer.ipc',
    dealerEndPoint2 = 'ipc://dealer2.ipc',
    dealerEndPoint3 = 'ipc://dealer3.ipc';

let router = zmq.socket("router").bind(routerEndPoint);

let dealers = ["service1", "service2", "service3"];
dealers["service1"] = zmq.socket("dealer").bind(dealerEndPoint);
dealers["service2"] = zmq.socket("dealer").bind(dealerEndPoint2);
dealers["service3"] = zmq.socket("dealer").bind(dealerEndPoint3);

let responders = ["service1", "service2", "service3"];
responders["service1"] = zmq.socket("rep").connect(dealerEndPoint);
responders["service2"] = zmq.socket("rep").connect(dealerEndPoint2);
responders["service3"] = zmq.socket("rep").connect(dealerEndPoint3);


function formatBuffer(buffer) {
    for (var i = 0; i < buffer.length; i++) {
        if (buffer[i] < 32 || buffer[i] > 127) {
            return buffer.toString("hex")
        }
    }
    return buffer.toString("utf8");
}

router.on('message', function(){
    let frames = Array.prototype.slice.call(arguments);
    let messageRequest = JSON.parse(formatBuffer(frames[2]));
    dealers[messageRequest.service].send(frames);
});

dealers["service1"].on('message', function() {
    let frames = Array.prototype.slice.call(arguments);
    router.send(frames);
});

dealers["service2"].on('message', function() {
    let frames = Array.prototype.slice.call(arguments);
    router.send(frames);
});

dealers["service3"].on('message', function() {
    let frames = Array.prototype.slice.call(arguments);
    router.send(frames);
});

responders["service1"].on('message', function(data) {
    let request = JSON.parse(data);
    responders["service1"].send(JSON.stringify({
        pid: "Service 1 (" + process.pid + ")",
        timestamp: Date.now()
    }));
});

responders["service2"].on('message', function(data) {
    let request = JSON.parse(data);
    responders["service2"].send(JSON.stringify({
        pid: "Service 2 (" + process.pid+ ")",
        timestamp: Date.now()
    }));
});

responders["service3"].on('message', function(data) {
    let request = JSON.parse(data);
    responders["service3"].send(JSON.stringify({
        pid: "Service 3 (" + process.pid+ ")",
        timestamp: Date.now()
    }));
});