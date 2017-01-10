/**
 * Created by Ben on 2016. 10. 26..
 */
"use strict";

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
                'http://ittott.tv/mytv?chanel=' + channel,
                {
                    form: {
                        mode: 'ajax'
                    }
                },
                function (error, response, body) {
                    var content = JSON.parse(body).content.ajaxpopup.value;
                    var url = $(content).find('source').attr('src');

                    self.lastChannel = {
                        name: channel,
                        url: url
                    };

                    cb(url);
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
        log('Generating channel list...');
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

        log('EPG újratöltése...' + this.collectedChannels.length + ' db csatorna');

        $.each(this.collectedChannels, function (index, value) {
            var channelIndex = value.channelIndex,
                name         = value.name,
                id           = value.id;

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
        });

        /**
         * XML legyártása
         */
        setTimeout(function () {
            var content = Epg.getXmlContainer(epgChannels + epgPrograms);
            fs.writeFileSync('../epg.xml', content);
            log('epg.xml újraírva');
        }, 120 * 1000);

        /**
         * XML újragyártása 12 óránként
         */
        setTimeout(function () {
            self.buildEPG();
        }, 12 * 60 * 60 * 1000);
    }
}

module.exports = Ittott;