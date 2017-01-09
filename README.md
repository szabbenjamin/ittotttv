# ittotttv
Ittott.tv kodi connect servlet

Figyelem!
A program alfa állapotú, saját magam használtam saját környezetben, sosem volt még más környezetben kipróbálva!
A program működéséért semmilyen garanciát nem vállalok, a leírás szükség esetén bővülni fog, ha észrevételed van írj nekem emailt ittott.tv servlet tárggyal a szabbenjamin@gmail.com email címre!
Használd egészséggel!


A programról
Ez egy servlet, ami fut egy linuxos szerveren és összeköttetést biztosít egy lejátszóprogram és az ittott.tv szolgáltatása között.
A servlet az indításakor letölti a rendelkezésre álló csatornák listáját és a hozzájuk tartozó epg (elektronikus programújságot). Ezek a letöltött állományok megetethetők a Kodi IPTV PVR pluginjával.

Beüzemelés, telepítés (linux rendszereken):

Telepítsd a nodejs futtatókörnyezetet a saját linux rendszeredre: https://nodejs.org/en/

Videófelvételhez telepítsd az ffmpeg csomagot!

Állj arra a mappára ahova a servletet telepíteni szeretnéd, majd:
git clone https://github.com/szabbenjamin/ittotttv
cd ittotttv
cp config.js.sample config.js
nano config.js

Itt töltsd ki az ittott.tv oldalon regisztrált bejelentkezési adataidat, illetve a preUrl és recordingLocation adatokat.

Ezután:
cd engine
nodejs tv_servlet.js

Ekkor elindul a csatornalista és az EPG betöltése, ez eltarthat néhány percig.

Ha az epg.xml újraírva információt látod nyisd meg a Kodit, engedélyezd a már telepített bővítmények között az IPTV PVR ügyfelet, majd az általános beállítások fülön állítsd be a generálódott channels.m3u fájlt, az EPG beállítások fülön pedig a generált epg.xml fájlt.
Ezután indítsd újra a Kodit, ha kell a beállításokban engedélyezd az IPTV PVR simple client-et, mint PVR ügyfelet és a betöltődött csatornalistában próbálj elindítani egy tv csatornát. Ekkor ha mindent jól csináltál a konzolon elkezd logolni a servlet. Ha nem történik semmi ellenőrizd a preUrl helyességét!

Jó szórakozást!
