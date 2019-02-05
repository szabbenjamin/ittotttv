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
            'eco2_M2_HD-HLS': 'https://musor.tv/heti/tvmusor/M2',
            'eco_Duna_HD-HLS': 'https://musor.tv/heti/tvmusor/DUNA',
            'eco2_M4Sport_HD-HLS': 'https://musor.tv/heti/tvmusor/M4_SPORT',
            'eco3_DunaWorld_HD-HLS': 'https://musor.tv/heti/tvmusor/DUNAWORLD',
            'eco2_M3_SD-HLS': 'https://musor.tv/heti/tvmusor/M3',
            'eco3_M5_HD-HLS': 'https://musor.tv/heti/tvmusor/M5',
            'eco2_ATV_SD-HLS': 'https://musor.tv/heti/tvmusor/ATV',
            'eco2_AXN_SD-HLS': 'https://musor.tv/heti/tvmusor/AXN',
            'eco_BonumTV_SD-HLS': 'https://musor.tv/heti/tvmusor/BONUM',
            'eco2_ComedyCentral_SD-HLS': 'https://musor.tv/heti/tvmusor/COMEDY',
            'eco_ComedyCentralFam_SD-HLS': 'https://musor.tv/heti/tvmusor/COMEDY_CENTRAL_FAMILY',
            'eco2_DaVinci_SD-HLS': 'https://musor.tv/heti/tvmusor/DAVINCI',
            'eco3_DikhTV_HD-HLS': 'https://musor.tv/heti/tvmusor/DIKH_TV',
            'eco_DuckTV_SD-HLS': 'https://musor.tv/heti/tvmusor/DUCKTV',
            'eco_EchoTV_SD-HLS': 'https://musor.tv/heti/tvmusor/ECHOTV',
            'eco2_EuroNews_SD-HLS': 'https://musor.tv/heti/tvmusor/EURONEWS',
            'eco2_Film4_SD-HLS': 'https://musor.tv/heti/tvmusor/FILM4',
            'eco_FitHD_SD-HLS': 'https://musor.tv/heti/tvmusor/FIT_HD',
            'eco_HirTV_SD-HLS': 'https://musor.tv/heti/tvmusor/HIRTV',
            'eco_Moziplus_SD-HLS': 'https://musor.tv/heti/tvmusor/MOZI_PLUSZ',
            'eco3_MTV_SD-HLS': 'https://musor.tv/heti/tvmusor/MTVHU',
            'eco2_MusicChannel_SD-HLS': 'https://musor.tv/heti/tvmusor/MUSICCHANNEL',
            'eco2_Nickelodeon_SD-HLS': 'https://musor.tv/heti/tvmusor/NICKELODEON',
            'eco2_Ozone_SD-HLS': 'https://musor.tv/heti/tvmusor/OZONENETWORK',
            'eco_Fem3_SD-HLS': 'https://musor.tv/heti/tvmusor/FEM3',
            'eco2_Prime_SD-HLS': 'https://musor.tv/heti/tvmusor/PRIME',
            'eco2_RTLplus_SD-HLS': 'https://musor.tv/heti/tvmusor/RTL_PLUSZ',
            'eco_RTLSpike_SD-HLS': 'https://musor.tv/heti/tvmusor/RTL_SPIKE',
            'eco_MagyarSlagerTV_SD-HLS': 'https://musor.tv/heti/tvmusor/SLAGERTV',
            'eco2_SonyMax_SD-HLS': 'https://musor.tv/heti/tvmusor/SONY_MAX',
            'eco_SonyMovie_SD-HLS': 'https://musor.tv/heti/tvmusor/SONY_MOVIE_CHANNEL',
            'eco2_TV4_SD-HLS': 'https://musor.tv/heti/tvmusor/TV4',
            'eco_TotalDanceTV_SD-HLS': 'https://musor.tv/heti/tvmusor/TOTALDANCE_TV',
            'eco3_Zenebutik_SD-HLS': 'https://musor.tv/heti/tvmusor/ZENEBUTIK',
            'eco_Story4_SD-HLS': 'https://musor.tv/heti/tvmusor/STORY4',
            'eco_SuperTV2_SD-HLS': 'https://musor.tv/heti/tvmusor/SUPERTV2',
            'eco2_CoolTV_SD-HLS': 'https://musor.tv/heti/tvmusor/COOL',
            'eco2_Filmplus_SD-HLS': 'https://musor.tv/heti/tvmusor/FILMPLUS',
            'eco_Filmbox_SD-HLS': 'https://musor.tv/heti/tvmusor/FILMBOX',
            'eco3_FixTV_SD-HLS': 'https://musor.tv/heti/tvmusor/FIXTV',
            'eco2_NatGeo_SD-HLS': 'https://musor.tv/heti/tvmusor/NATGEO',
            'eco2_RTL2_SD-HLS': 'https://musor.tv/heti/tvmusor/RTL2',
            'eco_RTLKlub_HD-HLS': 'https://musor.tv/heti/tvmusor/RTL',
            'eco2_TravelChannel_SD-HLS': 'https://musor.tv/heti/tvmusor/TRAVEL',
            'eco2_TV2_HD-HLS': 'https://musor.tv/heti/tvmusor/TV2',
            'eco2_Viasat3_SD-HLS': 'https://musor.tv/heti/tvmusor/VIASAT3',
            'eco2_Viasat6_SD-HLS': 'https://musor.tv/heti/tvmusor/VIASAT6',
            'eco_Boomerang_SD-HLS': 'https://musor.tv/heti/tvmusor/BOOMERANG',
            'eco2_Disney_SD-HLS': 'https://musor.tv/heti/tvmusor/DISNEY',
            'eco_DoQ_SD-HLS': 'https://musor.tv/heti/tvmusor/DOQ',
            'eco2_FandH_SD-HLS': 'https://musor.tv/heti/tvmusor/FISHING_HUNTING',
            'eco_Galaxy4_SD-HLS': 'https://musor.tv/heti/tvmusor/GALAXY',
            'eco_HitMusicChannel_SD-HLS': 'https://musor.tv/heti/tvmusor/HIT_MUSIC',
            'eco3_HetiTV_SD-HLS': 'https://musor.tv/heti/tvmusor/HETI_TV',
            'eco2_Izaura_SD-HLS': 'https://musor.tv/heti/tvmusor/IZAURA_TV',
            'eco2_LifeTV_SD-HLS': 'https://musor.tv/heti/tvmusor/LIFE_TV',
            'eco3_MuzsikaTV_SD-HLS': 'https://musor.tv/heti/tvmusor/MUZSIKATV',
            'eco_NatGeoWild_SD-HLS': 'https://musor.tv/heti/tvmusor/NATGEOWILD',
            'eco2_SpilerTV_SD-HLS': 'https://musor.tv/heti/tvmusor/SPILER_TV',
            'eco2_ViasatExplore_SD-HLS': 'https://musor.tv/heti/tvmusor/VIASATEXP',
            'eco2_ViasatHistory_SD-HLS': 'https://musor.tv/heti/tvmusor/VIASATHIST',
            'eco_ViasatNature_SD-HLS': 'https://musor.tv/heti/tvmusor/VIASATNAT'
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
