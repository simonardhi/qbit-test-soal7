'use strict';
const
    cluster = require('cluster'),
    zmq = require('zmq'),

    clusterCount = 3,
    externalEndpoint = 'tcp://127.0.0.1:5433',
    workerEndpoint = 'ipc://filer-dealer.ipc',
    workerEndpoint2 = 'ipc://filer-dealer-2.ipc',
    workerEndpoint3 = 'ipc://filer-dealer-3.ipc';
let jobCounter = 1;

if (cluster.isMaster) {
    let router = zmq.socket('router').bind(externalEndpoint);
    let dealer = zmq.socket('dealer').bind(workerEndpoint);
    let dealer2 = zmq.socket('dealer').bind(workerEndpoint2);
    let dealer3 = zmq.socket('dealer').bind(workerEndpoint3);
    router.on('message', function() {
        let frames = Array.prototype.slice.call(arguments);
        console.log(jobCounter);
        switch (jobCounter) {
            case 1:
                dealer.send(frames);
                break;
            case 2:
                dealer2.send(frames);
                break;
            case 3:
                dealer3.send(frames);
                break;
        }
    });
    dealer.on('message', function() {
        let frames = Array.prototype.slice.call(arguments);
        router.send(frames);
    });
    dealer2.on('message', function() {
        let frames = Array.prototype.slice.call(arguments);
        router.send(frames);
    });
    dealer3.on('message', function() {
        let frames = Array.prototype.slice.call(arguments);
        router.send(frames);
    });
    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is online.');
    });
    for (let i = 0; i < clusterCount; i++) {
        cluster.fork();
    }
    jobCounter += 1;
    jobCounter %= 3;
} else {
    let tempZMQ = zmq.socket('rep');
    let responder = tempZMQ.connect(workerEndpoint);
    let responder2 = tempZMQ.connect(workerEndpoint2);
    let responder3 = tempZMQ.connect(workerEndpoint3);

    responder.on('message', function(data) {
        let request = JSON.parse(data);
        console.log(process.pid + ' received request from: ' + request.service);
        responder.send(JSON.stringify({
            service: process.pid,
            message: "REP 1 : " + Date.now()
        }));

    });

    responder2.on('message', function(data) {
        let request = JSON.parse(data);
        console.log(process.pid + ' received request from: ' + request.service);
        responder.send(JSON.stringify({
            service: process.pid,
            message: "REP 2 : " + Date.now()
        }));

    });

    responder3.on('message', function(data) {
        let request = JSON.parse(data);
        console.log(process.pid + ' received request from: ' + request.service);
        responder.send(JSON.stringify({
            service: process.pid,
            message: "REP 3 : " + Date.now()
        }));

    });

}
