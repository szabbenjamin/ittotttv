/**
 * Created by Ben on 2016. 11. 26..
 */
'use strict';

var jsdom = require('jsdom');
var $ = require('jquery')(jsdom.jsdom().defaultView);
var request = require('request').defaults({jar: true});

/**
 * Olvasnivalók:
 * https://en.wikipedia.org/wiki/Electronic_program_guide
 * http://kodi.wiki/view/Add-on:IPTV_Simple_Client
 */
class Epg {
    constructor () {
        this.channelEpgUrls = {
            io_m2: 'https://musor.tv/heti/tvmusor/M2',
            io_dunatv: 'https://musor.tv/heti/tvmusor/DUNA',
            io_m4: 'https://musor.tv/heti/tvmusor/M4_SPORT',
            io_dunaworld: 'https://musor.tv/heti/tvmusor/DUNAWORLD',
            io_m3: 'https://musor.tv/heti/tvmusor/M3',
            io_m5: 'https://musor.tv/heti/tvmusor/M5',
            io_atv: 'https://musor.tv/heti/tvmusor/ATV',
            io_axn: 'https://musor.tv/heti/tvmusor/AXN',
            io_bonum: 'https://musor.tv/heti/tvmusor/BONUM',
            io_davinci: 'https://musor.tv/heti/tvmusor/DAVINCI',
            io_duck: 'https://musor.tv/heti/tvmusor/DUCKTV',
            io_echo: 'https://musor.tv/heti/tvmusor/ECHOTV',
            io_euronews: 'https://musor.tv/heti/tvmusor/EURONEWS',
            io_hirtv: 'https://musor.tv/heti/tvmusor/HIRTV',
            io_nickelodeon: 'https://musor.tv/heti/tvmusor/NICKELODEON',
            io_ozone: 'https://musor.tv/heti/tvmusor/OZONENETWORK',
            io_fem3: 'https://musor.tv/heti/tvmusor/FEM3',
            io_rtl_p: 'https://musor.tv/heti/tvmusor/RTL_PLUSZ',
            io_notatv: 'https://musor.tv/heti/tvmusor/SLAGERTV',
            io_story4: 'https://musor.tv/heti/tvmusor/STORY4',
            io_super_tv2: 'https://musor.tv/heti/tvmusor/SUPERTV2',
            io_viva_hungary: 'https://musor.tv/heti/tvmusor/VIVA',
            io_comedy_central_extra: 'https://musor.tv/heti/tvmusor/COMEDYEXTRA',
            io_cool: 'https://musor.tv/heti/tvmusor/COOL',
            io_film_p: 'https://musor.tv/heti/tvmusor/FILMPLUS',
            io_filmbox: 'https://musor.tv/heti/tvmusor/FILMBOX',
            io_fixtv: 'https://musor.tv/heti/tvmusor/FIXTV',
            io_nat_geo: 'https://musor.tv/heti/tvmusor/NATGEO',
            io_rtl2: 'https://musor.tv/heti/tvmusor/RTL2',
            io_rtlklub: 'https://musor.tv/heti/tvmusor/RTL',
            io_travel: 'https://musor.tv/heti/tvmusor/TRAVEL',
            io_tv2: 'https://musor.tv/heti/tvmusor/TV2',
            io_viasat3: 'https://musor.tv/heti/tvmusor/VIASAT3',
            io_boomerang: 'https://musor.tv/heti/tvmusor/BOOMERANG',
            io_disney: 'https://musor.tv/heti/tvmusor/DISNEY',
            io_disney_jr: 'https://musor.tv/heti/tvmusor/DISNEY_JUNIOR',
            io_doq: 'https://musor.tv/heti/tvmusor/DOQ',
            io_pvtv: 'https://musor.tv/heti/tvmusor/FISHING_HUNTING',
            io_galaxy: 'https://musor.tv/heti/tvmusor/GALAXY',
            io_hit_music_channel: 'https://musor.tv/heti/tvmusor/HIT_MUSIC',
            io_hetitv: 'https://musor.tv/heti/tvmusor/HETI_TV',
            io_izauratv: 'https://musor.tv/heti/tvmusor/IZAURA_TV',
            io_life: 'https://musor.tv/heti/tvmusor/LIFE_TV',
            io_muzsika: 'https://musor.tv/heti/tvmusor/MUZSIKATV',
            io_nat_geo_wild: 'https://musor.tv/heti/tvmusor/NATGEOWILD',
            io_spilertv: 'https://musor.tv/heti/tvmusor/SPILER_TV',
            io_story5: 'https://musor.tv/heti/tvmusor/STORY5',
            io_viasat6: 'https://musor.tv/heti/tvmusor/VIASAT6',
            io_viasat_explorer: 'https://musor.tv/heti/tvmusor/VIASATEXP',
            io_history: 'https://musor.tv/heti/tvmusor/VIASATHIST',
            io_viasat_nature: 'https://musor.tv/heti/tvmusor/VIASATNAT'
        };

        /*
         * Template fájlok az xml generálásához
         */
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
        // időzóna korrekció
        startCorrect.setHours(startCorrect.getHours() - 3);

        var endCorrect = new Date(end);
        // időzóna korrekció
        endCorrect.setHours(endCorrect.getHours() - 3);

        // Nem lehet egyszerre egy csatornán egy másodpercben egy csatornának kezdete és vége, így kivontunk belőle 1 mp-et
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
            month = '0'+month;
        }
        if(day.toString().length == 1) {
            day = '0'+day;
        }
        if(hour.toString().length == 1) {
            hour = '0'+hour;
        }
        if(minute.toString().length == 1) {
            minute = '0'+minute;
        }
        if(second.toString().length == 1) {
            second = '0'+second;
        }

        return '' + year+month+day+hour+minute+second;
    }

    /**
     * Műsorok letöltése
     * @param epgUrl
     * @param cb
     */
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
                $.each($(body).find('[itemtype="https://schema.org/BroadcastEvent"]'), function (index, program) {
                    var show = {
                        startDate: $(program).find('[itemprop="startDate"]').attr('content'),
                        name: $(program).find('[itemprop="name"] a').html(),
                        description: $(program).find('[itemprop="description"]').html()
                    };

                    shows.push(show);
                });

                // Rendezés
                shows.sort(function (a, b) {
                    a = new Date(a.startDate);
                    b = new Date(b.startDate);
                    return a < b ? -1 : a > b ? 1 : 0;
                });

                cb(shows);
            }
        );

    }
}

module.exports = Epg;