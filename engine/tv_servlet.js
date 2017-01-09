/**
 * Created by Ben on 2016. 10. 26..
 */
var http = require("http");
const fs = require('fs');
const exec = require('child_process').exec;

var Ittott = require('./ittott.js');
var Scheduler = require('./scheduler.js');

const config = require('../config.js');


const USERDATA = config.USERDATA;

var app = new Ittott(USERDATA),
    channels;

app.getChannelList(cnls => channels = cnls);

var server = http.createServer(function(request, response) {
    var get   = decodeURIComponent(request.url.substring(1)),
        param = get;

    get = get.substring(get.length-4, 0);

    if ((get.substring(0, 4) === 'http') || get.substring(0, 4) === 'rtmp') {
        response.writeHead(302, {
            'Location': get
        });
        response.end();
        console.log('Inditva: ' + get);
    }
    else if ((get.substring(0, 2) === 'io') && (channels.indexOf(get) !== -1)) {
        app.getChannel(get, function (url) {
            response.writeHead(302, {
                'Location': url
            });
            response.end();
        });
        console.log('Inditva: ' + get);
    }
    else if (get.substring(0, 11) === 'setprogram=') {
        response.writeHead(200, {"Content-Type": "text/html"});
        var program = param.substring(11);
        exec('nodejs addProgram.js ' + program);
        response.write('OK');
        response.end();
        console.log('Hozzaadva: ' + program);
    }
    else {
        response.writeHead(200, {"Content-Type": "text/html"});
        response.end();
    }

});

try {
    server.listen(8080);
} catch (e) {
    console.log('Hiba tortent: ', e.toString());
    return;
}
console.log("Server is listening");


app.generateChannelList();

var s = new Scheduler(Ittott, USERDATA);