/**
 * Created by Ben on 2016. 10. 26..
 */
var http = require("http");
const fs = require('fs');
const exec = require('child_process').exec;
var log = require('./log.js');

var Ittott = require('./ittott.js');
var Scheduler = require('./scheduler.js');

const config = require('../config.js');


const USERDATA = config.USERDATA;

var app = new Ittott(USERDATA),
    channels;

app.getChannelList(cnls => channels = cnls);

var hello = null;

var server = http.createServer(function(request, response) {
    var get   = decodeURIComponent(request.url.substring(1)),
        param = get;

    get = get.substring(get.length-4, 0);

    if ((get.substring(0, 4) === 'http') || get.substring(0, 4) === 'rtmp') {
        response.writeHead(302, {
            'Location': get
        });
        response.end();
        log('Inditva: ' + get);
    }
    else if ((get.substring(0, 2) === 'io') && (channels.indexOf(get) !== -1)) {
        app.getChannel(get, function (url) {
            clearInterval(hello);
            app.hello(url);

            response.writeHead(302, {
                'Location': url
            });
            response.end();

            hello = setInterval(() => {
                app.hello(url);
            }, 5000);
        });
        log('Inditva: ' + get);
    }
    else if (get.substring(0, 11) === 'setprogram=') {
        response.writeHead(200, {"Content-Type": "text/html"});
        var program = param.substring(11);
        exec('nodejs addProgram.js ' + program);
        response.write('OK');
        response.end();
        log('Hozzaadva: ' + program);
    }
    else {
        response.writeHead(200, {"Content-Type": "text/html"});
        response.end();
    }

});

try {
    var listenPort = parseInt(config.preUrl.split(':')[2].replace('/', ''));
    if (!isNaN(listenPort) && listenPort > 0) {
        server.listen(listenPort);
    }
    else {
        log(' HIBA! Érvénytelen megadott port: ' + listenPort);
        return;
    }

} catch (e) {
    log('Hiba tortent: ' + e.toString());
    return;
}
log("Server is listening: " + config.preUrl);


app.generateChannelList();


var s = new Scheduler(Ittott, USERDATA);