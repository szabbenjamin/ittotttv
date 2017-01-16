/**
 * Created by Ben on 2016. 10. 26..
 */
var http = require("http");
const fs = require('fs');
const exec = require('child_process').exec;
var log = require('./log.js');

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
const config = require('../config.js');
const USERDATA = config.USERDATA;

log('#############    Kezdés     ##############');

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
        log('Inditva: ' + get);
    }
    else if ((get.substring(0, 2) === 'io') && (channels.indexOf(get) !== -1)) {
        app.getChannel(get, function (url) {
            response.writeHead(302, {
                'Location': url
            });
            response.end();
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
    /**
     * Feldolgozzuk a config fájlban beállított preUrl-t és kinyerjük belőle a portszámot.
     * Ezen fog hallgatni a servlet
     * @type {Number}
     */
    var listenPort = parseInt(config.preUrl.split(':')[2].replace('/', ''));
    if (!isNaN(listenPort) && listenPort > 0) {
        server.listen(listenPort);
        log("Server is listening: " + config.preUrl);
    }
    else {
        log(' HIBA! Érvénytelen megadott port: ' + listenPort);
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
var s = new Scheduler(Ittott, USERDATA);