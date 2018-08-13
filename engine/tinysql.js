/**
 * Created by Ben on 2016. 10. 27..
 */
'use strict';

const fs = require('fs');
const dbfile = 'contents.db';

/**
 * Egy végtelenül egyszerű, de annál rondább "adatbázis kezelő" az ütemezőhöz.
 * Ez is ki fog kerülni a konzolos schedulerrel együtt.
 */
class TinySql {
    constructor () {
        try {
            var file = fs.readFileSync(dbfile).toString();
            this.data = JSON.parse(file);
        } catch (e) {
            this.data = [];
        }
    }

    setData(data) {
        this.data.push(data);
        fs.writeFileSync(dbfile, JSON.stringify(this.data));
    }

    getAllData () {
        return this.data;
    }

    getData (query) {
        var results = [];
        this.data.forEach(row => {
            if (row === null) {
                return;
            }

            var all = true;
            Object.keys(query).forEach(key => {
                if (typeof row[key] === 'undefined') {
                    all = false;
                }
                else if (row[key] !== query[key]) {
                    all = false;
                }
            });
            if (all) {
                results.push(row);
            }
        });

        return results;
    }

    rmData (id) {
        this.data[id] = null;
        fs.writeFileSync(dbfile, JSON.stringify(this.data));
    }
}

module.exports = TinySql;