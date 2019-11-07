/**
 * Created by Ben on 2016. 11. 26..
 */
'use strict';

var jsdom = require('jsdom');
var $ = require('jquery')(jsdom.jsdom().defaultView);
var request = require('request').defaults({jar: true});
var dateFormat = require('dateformat');
const htmlToText = require('html-to-text');

/**
 * Olvasnivalók:
 * https://en.wikipedia.org/wiki/Electronic_program_guide
 * http://kodi.wiki/view/Add-on:IPTV_Simple_Client
 */
class Epg {
    constructor () {
        this.channelEpgUrls = {
            'M1': 'https://musor.tv/heti/tvmusor/M1',
            'M2': 'https://musor.tv/heti/tvmusor/M2',
            'Duna': 'https://musor.tv/heti/tvmusor/DUNA',
            'M4Sport': 'https://musor.tv/heti/tvmusor/M4_SPORT',
            'DunaWorld': 'https://musor.tv/heti/tvmusor/DUNAWORLD',
//            'M3': 'https://musor.tv/heti/tvmusor/M3',
            'M5': 'https://musor.tv/heti/tvmusor/M5',
            'ATV': 'https://musor.tv/heti/tvmusor/ATV',
            'ATVSpirit': 'https://musor.tv/heti/tvmusor/ATV_SPIRIT',
            'AXN': 'https://musor.tv/heti/tvmusor/AXN',
            'BonumTV': 'https://musor.tv/heti/tvmusor/BONUM',
            'ComedyCentral': 'https://musor.tv/heti/tvmusor/COMEDY',
            'ComedyCentralFam': 'https://musor.tv/heti/tvmusor/COMEDY_CENTRAL_FAMILY',
            'DaVinci': 'https://musor.tv/heti/tvmusor/DAVINCI',
            'DikhTV': 'https://musor.tv/heti/tvmusor/DIKH_TV',
            'DuckTV': 'https://musor.tv/heti/tvmusor/DUCKTV',
            'EchoTV': 'https://musor.tv/heti/tvmusor/ECHOTV',
            'EuroNews': 'https://musor.tv/heti/tvmusor/EURONEWS',
            'Film4': 'https://musor.tv/heti/tvmusor/FILM4',
            'FitHD': 'https://musor.tv/heti/tvmusor/FIT_HD',
            'HirTV': 'https://musor.tv/heti/tvmusor/HIRTV',
            'Moziplus': 'https://musor.tv/heti/tvmusor/MOZI_PLUSZ',
            'MTV': 'https://musor.tv/heti/tvmusor/MTVHU',
            'MusicChannel': 'https://musor.tv/heti/tvmusor/MUSICCHANNEL',
            'Nickelodeon': 'https://musor.tv/heti/tvmusor/NICKELODEON',
            'Ozone': 'https://musor.tv/heti/tvmusor/OZONE_TV',
            'Fem3': 'https://musor.tv/heti/tvmusor/FEM3',
            'Prime': 'https://musor.tv/heti/tvmusor/PRIME',
            'RTLplus': 'https://musor.tv/heti/tvmusor/RTL_PLUSZ',
            'RTLSpike': 'https://musor.tv/heti/tvmusor/RTL_SPIKE',
            'MagyarSlagerTV': 'https://musor.tv/heti/tvmusor/SLAGERTV',
            'SonyMax': 'https://musor.tv/heti/tvmusor/SONY_MAX',
            'SonyMovie': 'https://musor.tv/heti/tvmusor/SONY_MOVIE_CHANNEL',
            'TV4': 'https://musor.tv/heti/tvmusor/TV4',
            'TotalDanceTV': 'https://musor.tv/heti/tvmusor/TOTALDANCE_TV',
            'Zenebutik': 'https://musor.tv/heti/tvmusor/ZENEBUTIK',
            'Story4': 'https://musor.tv/heti/tvmusor/STORY4',
            'SuperTV2': 'https://musor.tv/heti/tvmusor/SUPERTV2',
            'CoolTV': 'https://musor.tv/heti/tvmusor/COOL',
            'Filmplus': 'https://musor.tv/heti/tvmusor/FILMPLUS',
            'Filmbox': 'https://musor.tv/heti/tvmusor/FILMBOX',
            'FixTV': 'https://musor.tv/heti/tvmusor/FIXTV',
            'NatGeo': 'https://musor.tv/heti/tvmusor/NATGEO',
            'RTL2': 'https://musor.tv/heti/tvmusor/RTL2',
            'RTLKlub': 'https://musor.tv/heti/tvmusor/RTL',
            'TravelChannel': 'https://musor.tv/heti/tvmusor/TRAVEL',
            'TV2': 'https://musor.tv/heti/tvmusor/TV2',
            'Viasat3': 'https://musor.tv/heti/tvmusor/VIASAT3',
            'Viasat6': 'https://musor.tv/heti/tvmusor/VIASAT6',
            'Boomerang': 'https://musor.tv/heti/tvmusor/BOOMERANG',
            'Disney': 'https://musor.tv/heti/tvmusor/DISNEY',
            'DoQ': 'https://musor.tv/heti/tvmusor/DOQ',
            'FandH': 'https://musor.tv/heti/tvmusor/FISHING_HUNTING',
            'Galaxy4': 'https://musor.tv/heti/tvmusor/GALAXY',
            'HitMusicChannel': 'https://musor.tv/heti/tvmusor/HIT_MUSIC',
            'HetiTV': 'https://musor.tv/heti/tvmusor/HETI_TV',
            'Izaura': 'https://musor.tv/heti/tvmusor/IZAURA_TV',
            'LifeTV': 'https://musor.tv/heti/tvmusor/LIFE_TV',
            'MuzsikaTV': 'https://musor.tv/heti/tvmusor/MUZSIKATV',
            'NatGeoWild': 'https://musor.tv/heti/tvmusor/NATGEOWILD',
            'SpilerTV': 'https://musor.tv/heti/tvmusor/SPILER_TV',
            'ViasatExplore': 'https://musor.tv/heti/tvmusor/VIASATEXP',
            'ViasatHistory': 'https://musor.tv/heti/tvmusor/VIASATHIST',
            'ViasatNature': 'https://musor.tv/heti/tvmusor/VIASATNAT'
        };

        /*
         * Template fájlok az xml generálásához
         */
        this.channelTemplate = '<channel id="id:id"><display-name lang="hu">:channelName</display-name></channel>';
        this.programmeTemplate = '<programme start=":start" stop=":stop" channel="id:id">:programme</programme>';
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

    getProgrammeTemplate (id, start, end, show) {
        var startCorrect = new Date(start);
        var endCorrect = new Date(end);

        // Nem lehet egyszerre egy csatornán egy másodpercben egy csatornának kezdete és vége, így kivontunk belőle 1 mp-et
        endCorrect.setMilliseconds(endCorrect.getMilliseconds() - 1000);

        var programme = '<title lang="hu">' + show.title + '</title>';
        if (show.subTitle) programme += '<sub-title>' + show.subTitle + '</sub-title>';
        if (show.icon) programme += '<icon src="' + show.icon + '"/>';
        if (show.description) programme += '<desc>' + show.description + '</desc>';
        if (show.year) programme += '<date>' + show.year + '</date>';

        return this.programmeTemplate
            .replace(':id', id)
            .replace(':start', this.formatDate(startCorrect))
            .replace(':stop', this.formatDate(endCorrect))
            .replace(':programme', programme);
    }

    formatDate (date) {
        return dateFormat(date, "yyyymmddHHMMss o");
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
                $.each($(body).find('div[id^="period_"]').find('[itemtype="https://schema.org/BroadcastEvent"]'), function (index, program) {
                    var categoryYear = $(program).find('[itemprop="description"]').html().split(',');
                    var screenshot = $(program).find('div.smartpe_screenshot img').attr('src');
                    if (screenshot && screenshot.indexOf('//') != -1) {
                        screenshot = 'https://' + screenshot.replace('//','');
                    }
                    var show = {
                        startDate: $(program).find('[itemprop="startDate"]').attr('content'),
                        title: htmlToText.fromString($(program).find('[itemprop="name"] a').html()),
                        subTitle: htmlToText.fromString(categoryYear.length > 1 ? categoryYear[0] : ''),
                        year: categoryYear.length > 1 ? categoryYear[1] : categoryYear[0],
                        icon: screenshot ? screenshot : '',
                        description: htmlToText.fromString($(program).find('.smartpe_progentrylong').html())
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
