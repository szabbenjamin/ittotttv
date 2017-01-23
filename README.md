# ittotttv
**Ittott.tv kodi connect servlet, magyar IPTV alkalmazás KODI lejátszóeszközön**

Figyelem!
A program béta állapotú, jelenleg több gépen való tesztelés alapján működőképesnek mondható.
Mindenféle linuxos környezetben használható, Raspberry Pi eszközökön tesztelve!


**A programról**

Ez egy servlet, ami fut egy linuxos szerveren és összeköttetést biztosít egy lejátszóprogram és az ittott.tv szolgáltatása között.
A servlet az indításakor letölti a rendelkezésre álló csatornák listáját és a hozzájuk tartozó epg (elektronikus programújságot). Ezek a letöltött állományok megetethetők a Kodi IPTV PVR pluginjával.


**Telepítés - Raspberry PI**

OSMC alapú Kodi 17-es verziója a minimum követelmény. Töltsd le a legfrissebb OSMC-t, írd ki az SD kártyára. A telepítő fel fogja frissíteni az OSMC-t a 17-es verzióra.

Telepítés:

`wget https://raw.githubusercontent.com/szabbenjamin/ittotttv/master/osmc_installer.sh && bash osmc_installer.sh`


**Beüzemelés, telepítés (linux rendszereken):**

Telepítsd a nodejs v7 futtatókörnyezetet a saját linux rendszeredre: https://nodejs.org/en/download/package-manager/

Állj arra a mappára ahova a servletet telepíteni szeretnéd, majd:

`git clone https://github.com/szabbenjamin/ittotttv`

`cd ittotttv`

`cp config.js.sample config.js`

`nano config.js`

Itt töltsd ki az ittott.tv oldalon regisztrált bejelentkezési adataidat, illetve a preUrl-t.

Ezután:

`cd engine`

`npm start`


Ekkor elindul a csatornalista és az EPG betöltése, ez eltarthat néhány percig.

Ha az epg.xml újraírva információt látod nyisd meg a Kodit, engedélyezd a már telepített bővítmények között az IPTV PVR ügyfelet, majd az általános beállítások fülön állítsd be a generálódott channels.m3u fájlt, az EPG beállítások fülön pedig a generált epg.xml fájlt.

Ezután indítsd újra a Kodit, ha kell a beállításokban engedélyezd az IPTV PVR simple client-et, mint PVR ügyfelet és a betöltődött csatornalistában próbálj elindítani egy tv csatornát. Ekkor ha mindent jól csináltál a konzolon elkezd logolni a servlet. Ha nem történik semmi ellenőrizd a preUrl helyességét!

Jó szórakozást!
