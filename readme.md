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
## troubleshooting
Si vous n'arrivez pas à installer certains module vous pouvez retirer les modules `bufferutil`, `sodium`, `utf-8-validate`, `zlib-sync`, `erlpack` du [package.json](https://github.com/Shaynlink/mika/blob/master/package.json)
 - Erreur d'installation avec sodium : https://www.npmjs.com/package/sodium#install
 - A voir aussi : https://www.npmjs.com/package/node-gyp#installation


