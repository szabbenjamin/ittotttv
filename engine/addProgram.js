/**
 * Created by Ben on 2016. 10. 27..
 *
 * Műsor felvétele konzolos program.
 * Így kell futtatni:
 * nodejs addProgram.js
 *
 * Ha nem adsz további paramétert akkor kapsz egy rövid help-et a használatáról.
 * Ha kedved van kisérletezz vele, többet nem írok, mert deprecated
 */
var log = require('./log.js');
var TinySql = require('./tinysql.js');
/**
 * Adatbázis objektum
 * @type {TinySql}
 */
var db = new TinySql();
var list = db.getAllData();

/**
 * Paraméterlista (2-től indul)
 */
var params = process.argv;

if (params.length === 2) {
    console.log('Paramterek: "kezdes vege"');
    console.log('channel EEEE-HH-NN.OO:PP OO:PP');
}

console.log('');
/**
 * Várólistához adás
 */
if (params.length === 5) {
    var add = {
        id:         list.length,
        channel:    params[2],
        start:      params[3],
        end:        params[4]
    };
    db.setData(add);
}

/**
 * Program törlése
 */
if (params.length === 4 && params[2] === 'rm') {
    db.rmData(parseInt(params[3]));
    console.log('Torolve: ' + params[3]);
}






/**
 * Felvételek listázása (ha vannak)
 */
db = 0;
log = [];

list.forEach(data => {
    if (data !== null) {
        db++;
        log.push(data.id + '\t' + data.channel + '\t\t' + data.start + '\t' + data.end);
    }
});


if (db) {
    console.log('============== Varolistan levo felvetelek: ==============');
    log.forEach(data => {
        console.log(data);
    });
    console.log('=========================================================');
}