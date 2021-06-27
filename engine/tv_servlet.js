/**
 * Created by Ben on 2016. 10. 26..
 */
var http = require('http');
const exec = require('child_process').exec;
var log = require('./log.js');
const config = require('../config.js');

var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');
var serve = serveStatic(config.genFilesDir);

/**
 * Ittott.tv vezérlőprogramja, ez épít "tunnel"-t az ittotttv és a kodi közé.
 * Paraméterében bejelentkezési adatokat át kell adni
 * @type {Ittott}
 */
var Ittott = require('./ittott.js');

/**
 * Felvétel ütemező. Kivezetésre fog kerülni, egy webes felület fogja átvenni a helyét.
 * #DEPRECATED
 * @type {Scheduler}
 */
var Scheduler = require('./scheduler.js');

/**
 * User konfiguráció. Benne van a .gitignore-ban, a config.js.sample a mintája
 */
const USERDATA = config.USERDATA;

log('#############    Kezdés     ##############');

var app = new Ittott(USERDATA),
    channels;

app.getChannelList(cnls => channels = cnls);

var server = http.createServer(function(request, response) {
    var get   = decodeURIComponent(request.url.substring(1)),
        param = get;

    var url = require('url').parse(request.url);

    if (url.pathname.startsWith('/static')) {
        request.url = request.url.replace('/static', '');
        var done = finalhandler(request, response);
        serve(request, response, done);
    }
    else if ((get.substring(0, 4) === 'http') || get.substring(0, 4) === 'rtmp') {
        response.writeHead(302, {
            'Location': get
        });
        response.end();
        log('Inditva: ' + get);
    }
    else if (get.indexOf('.m3u8') !== -1) {
        get = get.replace('.m3u8', '');
        app.getChannel(get, function (url) {
            response.writeHead(302, {
                'Location': url
            });
            response.end();
        });
    }
    else if ((get.substring(0, 3) === 'eco') && (channels.indexOf(get) !== -1)) {
        app.getChannel(get, function (url) {
            response.writeHead(302, {
                'Location': 'http://' + url.substr(8)
            });
            response.end();
        });
        log('Inditva: ' + get);
    }
    else if (get.substring(0, 11) === 'setprogram=') {
        response.writeHead(200, {'Content-Type': 'text/html'});
        var program = param.substring(11);
        exec('nodejs addProgram.js ' + program);
        response.write('OK');
        response.end();
        log('Hozzaadva: ' + program);
    }
    else {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end('unknown request');
    }

});

try {
    /**
     * Feldolgozzuk a config fájlban beállított preUrl-t és kinyerjük belőle a portszámot.
     * Ezen fog hallgatni a servlet
     * @type {Number}
     */
    var listenIP = config.preUrl.split(':')[1].replace(/\//g, '');
    var listenPort = parseInt(config.preUrl.split(':')[2].replace(/\//g, ''));
    if (!isNaN(listenPort) && listenPort > 0 && listenIP) {
        server.listen(listenPort, listenIP);
        log('Server is listening: ' + config.preUrl);
    }
    else {
        log(' HIBA! Érvénytelen megadott port vagy IP cim => [IP: ' + listenIP + ' Port: ' + listenPort + "]");
        return;
    }

} catch (e) {
    log('Hiba tortent: ' + e.toString());
    return;
}

/**
 * Csatornalistát generálunk. Jelenleg futáskor blokkolja az erőforrásokat, miatta a server sem mindig válaszol.
 * Majd átalakításra kerül
 */
app.generateChannelList();

/**
 * Elindítja az időzítőt.
 * Kikommenteléssel le lehet kapcsolni, ha valahol zavart okozna
 * @type {Scheduler}
 */
new Scheduler(Ittott, USERDATA);
