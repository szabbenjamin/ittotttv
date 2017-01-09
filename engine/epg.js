/**
 * Created by Ben on 2016. 11. 26..
 */
"use strict";
var jsdom = require("jsdom");
var $ = require("jquery")(jsdom.jsdom().defaultView);
var request = require('request');
var request = request.defaults({jar: true});
const readlineSync = require('readline-sync');
const fs = require('fs');
const exec = require('child_process').exec;

class Epg {
    constructor () {
        this.channelEpgUrls = {
            io_m2: 'http://musor.tv/heti/tvmusor/M2',
            io_dunatv: 'http://musor.tv/heti/tvmusor/DUNA',
            io_m4: 'http://musor.tv/heti/tvmusor/M4_SPORT',
            io_dunaworld: 'http://musor.tv/heti/tvmusor/DUNAWORLD',
            io_m3: 'http://musor.tv/heti/tvmusor/M3',
            io_m5: 'http://musor.tv/heti/tvmusor/M5',
            io_atv: 'http://musor.tv/heti/tvmusor/ATV',
            io_bonum: 'http://musor.tv/heti/tvmusor/BONUM',
            io_davinci: 'http://musor.tv/heti/tvmusor/DAVINCI',
            io_duck: 'http://musor.tv/heti/tvmusor/DUCKTV',
            io_echo: 'http://musor.tv/heti/tvmusor/ECHOTV',
            io_euronews: 'http://musor.tv/heti/tvmusor/EURONEWS',
            io_hirtv: 'http://musor.tv/heti/tvmusor/HIRTV',
            io_nickelodeon: 'http://musor.tv/heti/tvmusor/NICKELODEON',
            io_ozone: 'http://musor.tv/heti/tvmusor/OZONENETWORK',
            io_fem3: 'http://musor.tv/heti/tvmusor/FEM3',
            io_rtl_p: 'http://musor.tv/heti/tvmusor/RTL_PLUSZ',
            io_notatv: 'http://musor.tv/heti/tvmusor/SLAGERTV',
            io_story4: 'http://musor.tv/heti/tvmusor/STORY4',
            io_super_tv2: 'http://musor.tv/heti/tvmusor/SUPERTV2',
            io_viva_hungary: 'http://musor.tv/heti/tvmusor/VIVA',
            io_comedy_central_extra: 'http://musor.tv/heti/tvmusor/COMEDYEXTRA',
            io_cool: 'http://musor.tv/heti/tvmusor/COOL',
            io_film_p: 'http://musor.tv/heti/tvmusor/FILMPLUS',
            io_filmbox: 'http://musor.tv/heti/tvmusor/FILMBOX',
            io_fixtv: 'http://musor.tv/heti/tvmusor/FIXTV',
            io_nat_geo: 'http://musor.tv/heti/tvmusor/NATGEO',
            io_rtl2: 'http://musor.tv/heti/tvmusor/RTL2',
            io_rtlklub: 'http://musor.tv/heti/tvmusor/RTL',
            io_travel: 'http://musor.tv/heti/tvmusor/TRAVEL',
            io_tv2: 'http://musor.tv/heti/tvmusor/TV2',
            io_viasat3: 'http://musor.tv/heti/tvmusor/VIASAT3'
        };
        this.channelTemplate = '<channel id="id:id"><display-name lang="hu">:channelName</display-name></channel>';
        this.programmeTemplate = '<programme start=":start +0100" stop=":end +0100" channel="id:id"><title lang="hu">:programme</title></programme>';
        this.xmlContainer = '<?xml version="1.0" encoding="utf-8" ?><tv>:content</tv>';
    }

    getChannelEpgUrls () {
        return this.channelEpgUrls;
    }

    getXmlContainer (content) {
        return this.xmlContainer
            .replace(':content', content);
    }

    getChannelEpg (id, channelName) {
        var channel = this.channelTemplate
            .replace(':id', id)
            .replace(':channelName', channelName);

        return channel;
    }

    getProgrammeTemplate (id, start, end, programme) {
        var startCorrect = new Date(start);
        startCorrect.setHours(startCorrect.getHours() - 3);

        var endCorrect = new Date(end);
        endCorrect.setHours(endCorrect.getHours() - 3);
        endCorrect.setMilliseconds(endCorrect.getMilliseconds() - 1000);

        return this.programmeTemplate
            .replace(':id', id)
            .replace(':start', this.formatDate(startCorrect))
            .replace(':end', this.formatDate(endCorrect))
            .replace(':programme', programme);
    }

    formatDate (date) {
        var d       = new Date(date);
        var year    = d.getFullYear();
        var month   = d.getMonth()+1;
        var day     = d.getDate();
        var hour    = d.getHours();
        var minute  = d.getMinutes();
        var second  = d.getSeconds();
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

        return '' + year+month+day+hour+minute+second;
    }

    loadEPG(epgUrl, cb) {
        var headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
            'Content-Type' : 'application/x-www-form-urlencoded'
        };

        var shows = [];

        request.get(
            epgUrl,
            {
                headers: headers
            },
            function (error, response, body) {
            var loadedShows = [];

            $.each($(body).find('[itemtype="http://schema.org/BroadcastEvent"]'), function (index, program) {
                var show = {
                    startDate: $(program).find('[itemprop="startDate"]').attr('content'),
                    name: $(program).find('[itemprop="name"] a').html(),
                    description: $(program).find('[itemprop="description"]').html()
                };

                shows.push(show);
            });

            shows.sort(function (a, b) {
                a = new Date(a.startDate);
                b = new Date(b.startDate);
                return a < b ? -1 : a > b ? 1 : 0;
            });

            cb(shows);
        });

    }
}

module.exports = Epg;