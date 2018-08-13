#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "Futtasd root modban. Ird be: sudo su"
  exit
fi

apt-get update;
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
apt-get install -y nodejs git
apt-get install -y npm
git clone https://github.com/szabbenjamin/ittotttv
cd ittotttv/engine

echo "#!/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
git pull origin master
cd /home/osmc/ittotttv/engine
npm start" > tv_servlet.sh
chmod +x tv_servlet.sh

npm install --only=prod
cd ..
cp config.js.sample config.js
echo "Add meg bejelentkezesi adataidat..."
sleep 5
nano config.js
echo "[Unit]
Description=Ittott.tv servlet app

[Service]
ExecStart=/home/osmc/ittotttv/engine/tv_servlet.sh
Restart=always
User=root
Group=root
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
WorkingDirectory=/home/osmc/ittotttv/engine

[Install]
WantedBy=multi-user.target" > ittotttv.service

cp ittotttv.service /etc/systemd/system
systemctl start ittotttv
systemctl enable ittotttv

echo "deb http://apt.osmc.tv krypton main" >> /etc/apt/sources.list
apt-get update
apt-get -y dist-upgrade && reboot
