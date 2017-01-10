/**
 * Created by Ben on 2016. 10. 27..
 */
"use strict";
var TinySql = require('./tinysql.js');
var log = require('./log.js');
const exec = require('child_process').exec;
const config = require('../config.js');

const recordingLocation = config.recordingLocation;

class Scheduler {
    constructor (ittotttv, userdata) {
        var self = this;

        this.ittotttv = {
            object: ittotttv,
            user: userdata
        };

        /**
         * Adatbázis objektum
         * @type {TinySql}
         */
        this.db = new TinySql();

        /**
         * Műsorok letöltésének indítása percenként
         */
        log('Musorok letoltesenek inditasa...');
        setInterval(function () {
            self.startRecord();
        }, 60 * 1000);
    }

    startRecord () {
        var self = this;
        /**
         * Itt újra ki kell olvassuk az adatbázis tartalmát, így újrapéldányosítjuk
         * @type {TinySql}
         */
        var db = new TinySql();

        var programs = db.getData({
            start: this.getNowDate()
        });

        var systemCall = 'ffmpeg -i ":url" -t :duration -c copy -bsf:a aac_adtstoasc :recordingLocation:filename.mp4 -nostdin -nostats </dev/null >/dev/null 2>&1 &';

        programs.forEach(data => {
            /**
             * Minden felvétel indításakor még bejelentkezünk, mert ha
             * több idő telik el kidob a rendszerből
             */
            var app = new this.ittotttv.object(this.ittotttv.user);
            app.login(() => {
                var start = {
                        y: data.start.substring(0, 4),
                        m: data.start.substring(5, 7),
                        d: data.start.substring(8, 10),
                        h: data.start.substring(11, 13),
                        i: data.start.substring(14, 16)
                    },
                    end   = {
                        y: start.y,
                        m: start.m,
                        d: start.d,
                        h: data.end.substring(0, 2),
                        i: data.end.substring(3, 6)
                    };

                /**
                 * calculate duration
                 */
                var t1 = new Date(end.y, end.m, end.d, end.h, end.i, 0, 0);
                var t2 = new Date(start.y, start.m, start.d, start.h, start.i, 0, 0);
                var dif = t1.getTime() - t2.getTime();

                var Seconds_from_T1_to_T2 = dif / 1000;
                var duration = Math.abs(Seconds_from_T1_to_T2);

                var filename = data.channel + '-' + data.start.replace(':', '-');

                app.getChannel(data.channel, url => {
                    exec(
                        systemCall
                        .replace(':url', url)
                        .replace(':filename', filename)
                        .replace(':duration', duration)
                        .replace(':recordingLocation', recordingLocation)
                    );
                });

                db.rmData(data.id);
                log('Felvetel: ' + data.channel);
            });
        });

    }

    getNowDate () {
        var now     = new Date();
        var year    = now.getFullYear();
        var month   = now.getMonth()+1;
        var day     = now.getDate();
        var hour    = now.getHours();
        var minute  = now.getMinutes();
        var second  = now.getSeconds();
        if(month.toString().length == 1) {
            var month = '0'+month;
        }
        if(day.toString().length == 1) {
            var day = '0'+day;
        }
        if(hour.toString().length == 1) {
            var hour = '0'+hour;
        }
        if(minute.toString().length == 1) {
            var minute = '0'+minute;
        }
        if(second.toString().length == 1) {
            var second = '0'+second;
        }

        return year+'-'+month+'-'+day+'.'+hour+':'+minute;
    }
}

module.exports = Scheduler;