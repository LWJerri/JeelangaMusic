# mika
[![GitHub license](https://img.shields.io/github/license/Shaynlink/mika.svg)](https://github.com/Shaynlink/mika/blob/master/LICENSE) [![Github all releases](https://img.shields.io/github/downloads/Shaynlink/mika/total.svg)](https://GitHub.com/Shaynlink/mika/releases/) [![GitHub stars](https://img.shields.io/github/stars/Shaynlink/mika.svg)](https://GitHub.com/Shaynlink/mika/stargazers/) [![GitHub watchers](https://img.shields.io/github/watchers/Shaynlink/mika.svg)](https://GitHub.com/Shaynlink/mika/watchers/) [![GitHub issues](https://img.shields.io/github/issues/Shaynlink/mika.svg)](https://GitHub.com/Shaynlink/mika/issues/) [![GitHub issues-closed](https://img.shields.io/github/issues-closed/Shaynlink/mika.svg)](https://GitHub.com/Shaynlink/node-anemy/issues?q=is%3Aissue+is%3Aclosed)

mika est un simple bot musique traduit en français.

## Commandes
prefix: **m!**
| Commande | Description |
| ------ | ------ |
| play | Joue de la musique |
| destroy | Arrête de joué de la musique |
| leave | quitte le salon |
| loop | Répete la musique |
| muteindicator | Arrête d'envoyer des messages à chaque fin de musique |
| nowplaying | Affiche les informations de la musique joué |
| pause | Met en pause la musique |
| queue | affiche la playlist |
| resume | Reprend la musique |
| skip | Passe à la musique suivante |
| skipto | Passe à la musique selectionné |
| volume | affiche ou change le volume |
| jpop | Radio jpop by [listen.moe](http://listen.moe/) |
| kpop | Radio kpop by [listen.moe](http://listen.moe/) |

#### play
[![exemple play](https://github.com/Shaynlink/mika/blob/master/assets/exemple/mika-exemple-1.png)](https://github.com/Shaynlink/mika)

#### nowplaying
[![exemple play](https://github.com/Shaynlink/mika/blob/master/assets/exemple/mika-exemple-2.png)](https://github.com/Shaynlink/mika)

#### help
[![exemple play](https://github.com/Shaynlink/mika/blob/master/assets/exemple/mika-exemple-3.png)](https://github.com/Shaynlink/mika)

## Installation

```bash
git clone https://github.com/Shaynlink/mika.git
cd mika
npm install
```

Créer un fichier `credentials.js`
```js
module.exports = {
  DISCORD_TOKEN: '[Votre token]',
  YOUTUBE_TOKEN: '[Votre token]',
};
```
 - discord token: https://discord.com/developers/applications
 - youtube token: https://developers.google.com/youtube/v3/getting-started

Lancer le bot
```bash
npm start
```

### Optional packages
- zlib-sync for WebSocket data compression and inflation (`npm install zlib-sync`)
- erlpack for significantly faster WebSocket data (de)serialisation (`npm install discordapp/erlpack`)
- One of the following packages can be installed for faster voice packet encryption and decryption:
  - sodium (`npm install sodium`)
  - libsodium.js (`npm install libsodium-wrappers`)
- bufferutil for a much faster WebSocket connection (`npm install bufferutil`)
- utf-8-validate in combination with bufferutil for much faster WebSocket processing (`npm install utf-8-validate`)

## troubleshooting
 - Erreur d'installation avec sodium : https://www.npmjs.com/package/sodium#install
 - Erreur d'installation avec @discordjs/opus : `npm i -g node-gyp node-pre-gyp` else https://www.npmjs.com/package/node-gyp#installation
 - A voir aussi : https://www.npmjs.com/package/node-gyp#installation
 - Erreur FFMPEG NOT FOUND: https://www.youtube.com/channel/UCUjo_IKa9Cqkx_x-rMly8MA/search?query=ffmpeg (lire commentaire épingler)


