/**
 * Created by Ben on 2016. 10. 26..
 */
"use strict";

var querystring = require('querystring');
var jsdom = require("jsdom");
var $ = require("jquery")(jsdom.jsdom().defaultView);
var request = require('request');
var request = request.defaults({jar: true});
const readlineSync = require('readline-sync');
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
        'Origin':'http://ittott.tv',
        'Pragma':'no-cache',
        'Referer':'http://ittott.tv/',
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
            'http://ittott.tv/?useraction=login',
            {
                form: this.user
            },
            function (error, response, body) {
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
                    url: 'http://ittott.tv/mytv?chanel=' + channel + '&playOnMobil=1',
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
                'http://ittott.tv/mytv',
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
                'http://ittott.tv/mytv',
                {
                    form: {
                        mode: 'ajax'
                    }
                },
                function (error, response, body) {
                    var content = JSON.parse(body).content.ajaxpopup.value,
                        links = $(content).find('.ajaxpopuplink'),
                        channels = '#EXTM3U tvg-shift=3\n';


                    $.each(links, (channelIndex, value) => {
                        var id      = $(value).attr('href').split('=')[1],
                            name    = $(value).find('img').attr('title');

                        if (typeof name !== 'undefined') {
                            channels += '#EXTINF:-' + channelIndex + ' tvg-id="id' + channelIndex + '" tvg-name="' + name + '" tvg-logo="logo1" group-title="' + name + '",' + name + '\n';
                            channels += preUrl + encodeURIComponent(id) + '.m3u\n';

                            self.collectedChannels.push({
                                channelIndex: channelIndex,
                                name: name,
                                id: id
                            });
                        }
                    });

                    fs.writeFileSync('../channels.m3u', channels);
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

        log('EPG ujratoltese...' + this.collectedChannels.length + ' db csatorna');

        /**
         * XML legyártása
         */
        var writeXml = () => {
            var content = Epg.getXmlContainer(epgChannels + epgPrograms);
            fs.writeFileSync('../epg.xml', content);
            log('epg.xml ujrairva');
        };

        var progress = setInterval(() => {
            // Ha elfogyott vége a dalnak, mentjük az xml-t
            if (self.collectedChannels.length === 0) {
                clearInterval(progress);
                writeXml();
                return;
            }

            var channelElement  = self.collectedChannels.pop(),
                channelIndex    = channelElement.channelIndex,
                name            = channelElement.name,
                id              = channelElement.id;

            if (typeof epgUrls[id] !== 'undefined') {
                epgChannels += Epg.getChannelEpg(channelIndex, name);

                Epg.loadEPG(epgUrls[id], function (shows) {
                    log(epgUrls[id] + ' ' + shows.length + ' scannelt musor');
                    for (var i = 0; i < shows.length; i++) {
                        var endStartDate = new Date(shows[i].startDate);
                        epgPrograms += Epg.getProgrammeTemplate(
                            channelIndex,
                            shows[i].startDate,
                            typeof shows[i+1] !== 'undefined'
                                ? shows[i+1].startDate : endStartDate.setHours(endStartDate.getHours() + 1),
                            shows[i].name + ' ' + shows[i].description
                        );
                    }
                });
            }
        }, 2000);

        /**
         * XML újragyártása 12 óránként
         */
        setTimeout(function () {
            self.buildEPG();
        }, 12 * 60 * 60 * 1000);
    }
}

module.exports = Ittott;