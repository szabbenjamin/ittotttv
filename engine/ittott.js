/**
 * Created by Ben on 2016. 10. 26..
 */
'use strict';

var querystring = require('querystring');
var jsdom = require('jsdom');
var $ = require('jquery')(jsdom.jsdom().defaultView);
var request = require('request').defaults({jar: true});
const fs = require('fs');
var epgClass = require('./epg');
var Epg = new epgClass();
var log = require('./log.js');

const config = require('../config.js');

var header = function (form) {
    return {
        'Accept':'application/json, text/javascript, */*; q=0.01',
        'Accept-Encoding':'gzip, deflate',
        'Accept-Language':'hu-HU,hu;q=0.8,en-US;q=0.6,en;q=0.4',
        'Cache-Control':'no-cache',
        'Connection':'keep-alive',
        'Content-Length': querystring.stringify(form).length,
        'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
        'Host':'ittott.tv',
        'Origin':'https://ittott.tv',
        'Pragma':'no-cache',
        'Referer':'https://ittott.tv/',
        'User-Agent':'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Mobile Safari/537.36',
        'X-Requested-With':'XMLHttpRequest'
    };
};

const preUrl = config.preUrl;

class Ittott {
    constructor (user) {
        this.user = user;
        this.isLoggedIn = false;
        this.lastChannel = {
            name: null,
            url: null
        };

        this.collectedChannels = [];
        this.lastChannelTimeout;
    }

    /**
     * Minden olyan híváshoz szükséges ami bejelentkezett állapotot kíván.
     * A metódus paramétere egy callback, amiben megadhatók a bejelentkezést követő utasítások.
     *
     * A bejelentkezést az objektum eltárolja, az első ráfutáskor loginol csak.
     * @param cb
     */
    login (cb) {
        var self = this;
        if (this.isLoggedIn) {
            cb();
            return;
        }

        request.post(
            'https://ittott.tv/?useraction=login',
            {
                form: this.user
            },
            function () {
                self.isLoggedIn = true;
                cb(arguments);
            }
        );
    }

    getChannel (channel, cb) {
        var self = this;
        this.login(() => {
            if (self.lastChannel.name === channel) {
                cb(self.lastChannel.url);
                log('...from cache');
                return;
            }

            request.post(
                {
                    url: 'https://ittott.tv/mytv?chanel=' + channel + '&playOnMobil=1',
                    form: {
                        mode: 'ajax'
                    },
                    headers: header({
                        mode: 'ajax'
                    })
                },
                function (error, response, body) {
                    var d = body.split("window.location.assign('");
                    var a = d[1].split("')");

                    /**
                     * Lejátszási url
                     * @type {string} url
                     */
                    var url = a[0].replace(/\\/g, '');

                    self.lastChannel = {
                        name: channel,
                        url: url
                    };

                    clearTimeout(self.lastChannelTimeout);
                    self.lastChannelTimeout = setTimeout(() => {
                        log('clear cache: ' + channel);
                        self.lastChannel.name = null;
                    }, 1000 * 60 * 60); // 1h

                    setTimeout(function () {
                        cb(url);
                    }, 200);
                }
            );
        });
    }

    getChannelList(cb) {
        this.login(() => {
            request.post(
                'https://ittott.tv/mytv',
                {
                    form: {
                        mode: 'ajax'
                    }
                },
                function (error, response, body) {
                    var content     = JSON.parse(body).content.ajaxpopup.value,
                        links       = $(content).find('.ajaxpopuplink'),
                        elements    = [];

                    $.each(links, (index, value) => {
                        var id      = $(value).attr('href').split('=')[1],
                            name    = $(value).find('img').attr('title');

                        if ((typeof name !== 'undefined') && (id.substring(0, 4) !== 'http') && (id.substring(0, 4) !== 'rtmp')) {
                            elements.push(id);
                        }
                    });
                    log('Csatornalista betoltve');
                    cb(elements);
                }
            );
        });
    }

    generateChannelList () {
        var self = this;
        log('Csatornalista generalas...');
        this.login(() => {
            request.post(
                'https://ittott.tv/mytv',
                {
                    form: {
                        mode: 'ajax'
                    }
                },
                function (error, response, body) {
                    var content = JSON.parse(body).content.ajaxpopup.value,
                        links = $(content).find('.ajaxpopuplink'),
                        channels = '#EXTM3U\n';


                    $.each(links, (channelIndex, value) => {
                        var id      = $(value).attr('href').split('=')[1],
                            name    = $(value).find('img').attr('title');
                        var logo    = $(value).find('img').attr('src');

                        if (typeof name !== 'undefined' && name.length > 0) {
                            name = name.replace("'","");
                            if (logo.length > 0) logo = 'http://ittott.tv' + logo;
                            channels += '#EXTINF:0' /*+ channelIndex*/ + ' tvg-id="id' +  channelIndex + '" tvg-logo="' + logo + '" tvg-name="' + name + '" group-title="' + name + '",' + name + '\n';
                            channels += preUrl + encodeURIComponent(id) + '.m3u8\n';

                            self.collectedChannels.push({
                                channelIndex: channelIndex,
                                name: name,
                                id: id
                            });
                        }
                    });
                    fs.mkdirSync(config.genFilesDir, { recursive: true });
                    fs.writeFileSync(config.genFilesDir + '/channels.m3u', channels);
                    self.buildEPG();
                }
            );
        });
    }

    buildEPG () {
        var self = this,
            epgChannels = '',
            epgPrograms = '',
            epgUrls     = Epg.getChannelEpgUrls();

        log('EPG betoltese... Talaltam ' + this.collectedChannels.length + ' db csatornat');

        /**
         * XML legyártása
         */
        var writeXml = () => {
            var content = Epg.getXmlContainer(epgChannels + epgPrograms);
            fs.mkdirSync(config.genFilesDir, { recursive: true });
            fs.writeFileSync(config.genFilesDir + '/epg.xml', content);
            log('epg.xml ujrairva');
        };

        const sleep = (milliseconds) => {
            return new Promise(resolve => setTimeout(resolve, milliseconds))
        }

	// pre-filter list to avoid unnecessary cycles below
	// TODO: refactor, use worker instead!
        const channel_list_temp = this.collectedChannels.filter(function(item){
		var channel = item.id.split('_')[1];
		if (typeof epgUrls[channel] === 'undefined') {
			log(`Nem talalhato ehhez EPG: ${item.id}`);
			return false;
		}
		return true;
	});

        var progress = setInterval(() => {
            // Ha elfogyott vége a dalnak, mentjük az xml-t
            if (channel_list_temp.length === 0) {
                clearInterval(progress);
                sleep(2000).then(() => {
                    writeXml();
                })
                return;
            }

            var channelElement  = channel_list_temp.pop(),
                channelIndex    = channelElement.channelIndex,
                name            = channelElement.name,
                id              = channelElement.id;

            var channel = id.split('_')[1];

            epgChannels += Epg.getChannelEpg(channelIndex, name);

            Epg.loadEPG(epgUrls[channel], function (shows) {
                log(epgUrls[channel] + ' ' + shows.length + ' scannelt musor');
                for (var i = 0; i < shows.length; i++) {
                    var endStartDate = new Date(shows[i].startDate);
                    epgPrograms += Epg.getProgrammeTemplate(
                        channelIndex,
                        shows[i].startDate,
                        typeof shows[i+1] !== 'undefined'
                            ? shows[i+1].startDate : endStartDate.setHours(endStartDate.getHours() + 1),
                        shows[i]
                    );
                }
            });
        }, 2000);

        /**
         * XML újragyártása 12 óránként
         */
        setTimeout(function () {
            log('XML ujragyartasa...');
            self.buildEPG();
        }, 12 * 60 * 60 * 1000);
    }
}

module.exports = Ittott;
