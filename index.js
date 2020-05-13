'use strict';

const {Client, MessageCollector} = require('discord.js');
const client = new Client();
const axios = require('axios');
const credentials = require('./credentials');
const config = require('./config');
const ytdl = require('ytdl-core');
const moment = require('moment');
const {JpopClient, KpopClient} = require('./client');

client.music = {};
client.jpop = {
  broadcast: null,
  dispatcher: null,
  ws: new JpopClient(),
  data: null,
};
client.kpop = {
  broadcast: null,
  dispatcher: null,
  ws: new KpopClient(),
  data: null,
};

client.on('ready', () => {
  console.log(`${client.user.username} est prêt`);
  client.jpop.broadcast = client.voice.createBroadcast();
  client.jpop.dispatcher = client.jpop.broadcast.play('https://listen.moe/stream');
  client.jpop.broadcast.on('subscribe', (dispatcher) => {
    console.log('New broadcast subscriber!');
  });
  client.jpop.broadcast.on('unsubscribe', (dispatcher) => {
    console.log('Channel unsubscribed from broadcast :(');
  });
  client.kpop.broadcast = client.voice.createBroadcast();
  client.kpop.dispatcher = client.kpop.broadcast.play('https://listen.moe/kpop/stream');
  client.kpop.broadcast.on('subscribe', (dispatcher) => {
    console.log('New broadcast subscriber!');
  });
  client.kpop.broadcast.on('unsubscribe', (dispatcher) => {
    console.log('Channel unsubscribed from broadcast :('); ;
  });
});

client.on('message', async (message) => {
  if (!message.guild || message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  initMusic(message);
  if (command === 'play') {
    if (!message.guild.me.voice.channel) {
      if (!message.member.voice.channel) {
        return message.channel.send('Vous devez rejoindre le salon avant');
      };
      if (hasPermission(message)) {
        client.music[message.guild.id].connection =
          await message.member.voice.channel.join();
      } else {
        return message.reply('Vous ne pouvez pas ajouter le bot en vocal');
      };
    } else {
      if (!client.music[message.guild.id].connection) {
        client.music[message.guild.id].connection =
          await message.member.voice.channel.join();
      };
    };
    if (!args.join(' ')) return play(message);
    const youtube = await getMusic(args);
    if (youtube.error) return message.channel.send(youtube.error.message);
    if (youtube.isAxiosError) {
      return message.channel.send(`ERROR: code http ${youtube.status}`);
    };
    const content = {
      embed: {
        title: 'Liste de musique',
        description: `${youtube.items.map((v, i) =>
          `[${i+1}] ${v.snippet.title}`).join('\n')}`,
        timestamp: Date.now(),
        footer: {
          text: '`cancel` pour quitter la selection',
          icon_url: client.user
              .displayAvatarURL({format: 'webp', dynamic: true, size: 2048}),
        },
      },
    };
    message.channel.send(content).then((msg) => {
      const filter = (msg) => msg.author.id === message.author.id;
      const collector = new MessageCollector(message.channel, filter, {
        time: 20000,
      });
      collector.on('collect', async (msgCollected) => {
        const choice = msgCollected.content.trim().split()[0];
        if (choice.toLowerCase() === 'cancel') {
          return collector.stop('STOPPED');
        };
        if (!choice || isNaN(choice)) {
          return message.channel.send('Votre choix est invalide');
        };
        if (choice > youtube.items.length || choice <= 0) {
          return message.reply('Votre choix ne fait pas parti de la selection');
        };
        const song = youtube.items[choice - 1];
        collector.stop('PLAY');
        msg.delete();
        msgCollected.delete();
        const info = await ytdl.getBasicInfo(`https://www.youtube.com/watch?v=${song.id.videoId}`);
        song.time = JSON.parse(JSON.stringify(info)).length_seconds*1000;
        song.request = message.member;
        client.music[message.guild.id].queue.push(song);
        if (client.music[message.guild.id].queue.length > 1) {
          message.channel.send({
            embed: {
              title: 'Ajout à la playlist',
              description: song.snippet.title,
              thumbnail: {
                url: song.snippet.thumbnails.high.url,
              },
            },
          });
        } else {
          if (client.music[message.guild.id].queue <= 1) {
            client.music[message.guild.id].dispatcher = 0;
          };
          play(message);
        };
      });
      collector.on('end', (collected, reason) => {
        if (reason === 'STOPPED') {
          return message.reply('Vous avez stopper la selection');
        } else if (reason === 'PLAY') {
          return false;
        } else {
          return message.reply('Vous n\'avez pas fait de choix à temp');
        };
      });
    });
  };
  if (command === 'destroy') {
    if (!client.music[message.guild.id]) {
      return message.channel.send(`Aucune musique est initié`);
    };
    if (!client.music[message.guild.id].dispatcher) {
      return message.channel.send('Je ne joue pas de musique');
    };
    if (!hasPermission(message)) {
      return message.channel.send('Vous ne pouvez pas coupé la musique');
    };
    await client.music[message.guild.id].dispatcher.destroy();
    client.music[message.guild.id].dispatcher = null;
  };
  if (command === 'leave') {
    if (!hasPermission(message)) {
      return message.channel.send('Vous ne pouvez pas coupé la musique');
    };
    if (!client.music[message.guild.id]) {
      return message.channel.send('Je ne suis pas dans un salon');
    };
    if (client.music[message.guild.id].dispatcher) {
      client.music[message.guild.id].dispatcher.destroy();
    };
    client.music[message.guild.id].dispatcher = null;
    await message.guild.me.voice.channel.leave();
    client.music[message.guild.id].connection = null;
  };
  if (command === 'loop') {
    if (client.music[message.guild.id].broadcast) {
      return message.reply('Vous ne pouvez pas répéter une radio');
    } else if (!client.music[message.guild.id].dispatcher) {
      return message.reply('Je ne joue pas de musique');
    };
    switch (args.join('')) {
      case 'off':
        client.music[message.guild.id].loop = 'off';
        message.react('➡️');
        break;
      case 'on':
        client.music[message.guild.id] = 'on';
        message.react('🔁');
        break;
      case 'once':
        client.music[message.guild.id].loop = 'once';
        message.react('🔂');
        break;
      default:
        if (client.music[message.guild.id].loop === 'off') {
          client.music[message.guild.id].loop = 'on';
          message.react('🔁');
        } else if (guild.player.loop === 'on') {
          client.music[message.guild.id].loop = 'once';
          message.react('🔂');
        } else if (guild.player.loop === 'once') {
          client.music[message.guild.id].loop = 'off';
          message.react('➡️');
        };
        break;
    };
  };
  if (command === 'muteindicator') {
    if (client.music[message.guild.id].muteIndicator) {
      client.music[message.guild.id].muteIndicator = false;
      return message.react('❌');
    } else {
      client.music[message.guild.id].muteIndicator = true;
      return message.react('⭕');
    };
  };
  if (command === 'nowplaying') {
    if (!client.music[message.guild.id]) return message.react('💢');
    if (!client.music[message.guild.id].dispatcher) {
      return message.channel.send('Je ne joue pas de musique');
    };
    switch (client.music[message.guild.id].type) {
      case 'player':
        const duration =
          moment.duration({
            ms: client.music[message.guild.id].queue[
                client.music[message.guild.id].index].time,
          });
        const progress =
         moment.duration({
           ms: client.music[message.guild.id].dispatcher.streamTime,
         });
        // eslint-disable-next-line max-len
        const progressBar = ['▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬'];
        // eslint-disable-next-line max-len
        const calcul = Math.round(progressBar.length * (client.music[message.guild.id].dispatcher.streamTime/ (client.music[message.guild.id].queue[
            client.music[message.guild.id].index].time)));
        progressBar[calcul] = '🔘';
        message.channel.send({
          embed: {
            title: 'Now playing',
            // eslint-disable-next-line max-len
            description: `[${
              client.music[message.guild.id].queue[
                  client.music[message.guild.id].index]
                  .snippet.title
            }](https://www.youtube.com/watch?v=${client.music[message.guild.id].queue[client.music[message.guild.id].index].id.videoId})`,
            thumbnail: {
              url:
              client.music[message.guild.id].queue[
                  client.music[message.guild.id].index]
                  .snippet.thumbnails.default.url,
            },
            fields: [
              {
                name: 'Durée:',
                // eslint-disable-next-line max-len
                value: '[`' + progress.minutes() + ':' + progress.seconds() + '`] ' + progressBar.join('') + ' [`' + duration.minutes() + ':' + duration.seconds() + '`]',
              },
            ],
          },
        });
        break;
      case 'jpop':
        message.channel.send({
          embed: {
            title: 'Now playing',
            // eslint-disable-next-line max-len
            description: `[Jpop] ${client.jpop.data.song.title}${client.jpop.data.song.albums.length > 0 ?
                `${client.jpop.data.song.albums[0].nameRomanji ?
                `\n**name Romanji**: ${
                  client.jpop.data.song.albums[0].nameRomanji
                }` :
                ''}` :
                ''}\n**Song Duration**: ${
              convert(client.jpop.data.song.duration*1000).minutes
            }:${
              convert(client.jpop.data.song.duration*1000).seconds
            } minutes`,
            thumbnail: {
              url: `https://cdn.listen.moe/covers/${client.jpop.data.song.albums[0].image}`,
            },
          },
        });
        break;
      case 'kpop':
        message.channel.send({
          embed: {
            title: 'Now playing',
            // eslint-disable-next-line max-len
            description: `[Kpop] ${client.kpop.data.song.title}${client.kpop.data.song.albums.length > 0 ?
                  `${client.jpop.data.song.albums[0].nameRomanji ?
                  `\n**name Romanji**: ${
                    client.kpop.data.song.albums[0].nameRomanji
                  }` :
                  ''}` :
                  ''}\n**Song Duration**: ${
              convert(client.kpop.data.song.duration*1000).minutes
            }:${
              convert(client.kpop.data.song.duration*1000).seconds
            } minutes`,
            thumbnail: {
              url: `https://cdn.listen.moe/covers/${client.kpop.data.song.albums[0].image}`,
            },
          },
        });
        break;
      default:
        break;
    };
  };
  if (command === 'pause') {
    if (!client.music[message.guild.id]) return message.react('💢');
    if (client.music[message.guild.id].dispatcher === null) {
      return message.reply('Je ne joue pas de musique');
    };
    if (!hasPermission(message)) {
      return message.channel.send('Vous ne pouvez pas coupé la musique');
    };
    if (client.music[message.guild.id].broadcast) {
      return message.reply('Vous ne pouvez pas mettre en pause une radio');
    };
    if (!client.music[message.guild.id].isPlaying) {
      return message.reply('La musique est en pause');
    };
    client.music[message.guild.id].dispatcher.pause();
    client.music[message.guild.id].isPlaying = false;
  };
  if (command === 'queue') {
    if (!client.music[message.guild.id].queue ||
        client.music[message.guild.id].queue.length < 1) {
      return message.channel.send('La playlist est vide');
    };
    if (!args.join('')) {
      return message.channel.send({
        embed: {
          title: 'Voicie la playlist',
          description: `arguments: \`clear [all or number]\`\n\n`+
            `${client.music[message.guild.id].queue.map((v, i) =>
              `[${i+1}] ${v.snippet.title}`).join('\n')}`,
        },
      });
    };
    const act = args.shift();
    if (act !== 'clear') {
      // eslint-disable-next-line max-len
      return message.channel.send(`Veillez choisir \`clear\` comme argument`);
    };
    if (args.join('') === 'all') {
      client.music[message.guild.id].queue = [];
      return message.react('✅');
    } else if (client.music[message.guild.id].queue[args.join('')-1]) {
      client.music[message.guild.id].queue =
        client.music[message.guild.id].queue.splice(args.join('')-1, 1);
      return message.react('✅');
    } else {
      // eslint-disable-next-line max-len
      return message.channel.send(`Veillez choisir entre \`all\` ou un nombre`);
    }
  };
  if (command === 'resume') {
    if (!client.music[message.guild.id]) return message.react('💢');
    if (client.music[message.guild.id].dispatcher === null) {
      return message.reply('Je ne joue pas de musique');
    };
    if (!hasPermission(message)) {
      return message.channel.send('Vous ne pouvez pas coupé la musique');
    };
    if (client.music[message.guild.id].broadcast) {
      return message.reply('⚠️');
    };
    if (client.music[message.guild.id].isPlaying) {
      return message.reply(language(guild.lg, 'command_music_isResume'));
    };
    client.music[message.guild.id].dispatcher.resume();
    client.music[message.guild.id].isPlaying = true;
  };
  if (command === 'skip') {
    if (!client.music[message.guild.id]) return message.react('💢');
    if (client.music[message.guild.id].dispatcher === null) {
      return message.reply('Je ne joue pas de musique');
    };
    if (!hasPermission(message)) {
      return message.channel.send('Vous ne pouvez pas coupé la musique');
    };
    if (client.music[message.guild.id].broadcast) {
      return message.reply('Vous ne pouvez skip une radio');
    };
    switch (client.music[message.guild.id].loop) {
      case 'off':
        client.music[message.guild.id].queue =
          client.music[message.guild.id].queue.shift();
        play(message);
        break;
      default:
        await client.music[message.guild.id].dispatcher.destroy();
        if (client.music[message.guild.id].index ===
          client.music[message.guild.id].queue.length - 1) {
          client.music[message.guild.id].index = 0;
        } else {
          client.music[message.guild.id].index++;
        };
        play(message);
        break;
    }
  };
  if (command === 'skipto') {
    if (!client.music[message.guild.id]) return message.react('💢');
    if (client.music[message.guild.id].dispatcher === null) {
      return message.reply('Je ne joue pas de musique');
    };
    if (!hasPermission(message)) {
      return message.channel.send('Vous ne pouvez pas coupé la musique');
    };
    if (client.music[message.guild.id].broadcast) {
      return message.reply('Vous ne pouvez pas skip une radio');
    };
    if (isNaN(args.join(' '))) {
      return message.reply('Vous n\'avez pas mis un nombre');
    };
    if (args.join(' ') > client.music[message.guild.id].queue-1) {
      return message.react('💢');
    };
    switch (client.music[message.guild.id].loop) {
      case 'off':
        client.music[message.guild.id].queue =
          client.music[message.guild.id].queue.slice(args.join(' ')-1);
        client.music[message.guild.id].index = 0;
        play(message);
        break;
      default:
        await client.music[message.guild.id].dispatcher.destroy();
        client.music[message.guild.id].index = args.join(' ')-1;
        play(message, guild);
        break;
    }
  };
  if (command === 'volume') {
    if (!client.music[message.guild.id]) return message.react('💢');
    if (client.music[message.guild.id].dispatcher === null) {
      return message.reply('je ne joue pas de musique');
    };
    if (!hasPermission(message)) {
      return message.channel.send('Vous ne pouvez pas coupé la musique');
    };
    if (client.music[message.guild.id].broadcast) {
      return message.channel
          .send('Vous ne pouvez pas changer le volume d\'une radio');
    };
    if (!args.join('')) {
      return message.reply(`Le volume est à ${
        client.music[message.guild.id].dispatcher.volume*100}%`);
    };
    if (isNaN(args.join(''))) {
      return message.reply('Votre valeur n\'est pas un nombre');
    };
    client.music[message.guild.id].volume = args.join('');
    await client.music[message.guild.id].dispatcher
        .setVolume(args.join('')/100);
    return message.reply(`Le volume est à present à ${
      client.music[message.guild.id].dispatcher.volume*100}%`);
  };
  if (command === 'jpop') {
    if (!message.guild.me.voice.channel) {
      if (!message.member.voice.channel) {
        return message.channel.send('Vous devez rejoindre le salon avant');
      };
      if (hasPermission(message)) {
        client.music[message.guild.id].connection =
            await message.member.voice.channel.join();
      } else {
        return message.reply('Vous ne pouvez pas ajouter le bot en vocal');
      };
    } else {
      if (!client.music[message.guild.id].connection) {
        client.music[message.guild.id].connection =
            message.member.voice.channel;
      };
    };
    if (client.music[message.guild.id].dispatcher) {
      client.music[message.guild.id].dispatcher.destroy();
    };
    client.music[message.guild.id].dispatcher =
      await client.music[message.guild.id].connection
          .play(client.jpop.broadcast);
    client.music[message.guild.id].broadcast = true;
    client.music[message.guild.id].type = 'jpop';
    message.channel.send({
      embed: {
        description: `Je joue actuellement ${client.jpop.data.song.title}`,
        thumbnail: {
          url: `https://cdn.listen.moe/covers/${client.jpop.data.song.albums[0]?
          client.jpop.data.song.albums[0].image :
        ''}`,
        },
      },
    });
  };
  if (command === 'kpop') {
    if (!message.guild.me.voice.channel) {
      if (!message.member.voice.channel) {
        return message.channel.send('Vous devez rejoindre le salon avant');
      };
      if (hasPermission(message)) {
        client.music[message.guild.id].connection =
            await message.member.voice.channel.join();
      } else {
        return message.reply('Vous ne pouvez pas ajouter le bot en vocal');
      };
    } else {
      if (!client.music[message.guild.id].connection) {
        client.music[message.guild.id].connection =
            await message.member.voice.channel.join();
      };
    };
    if (client.music[message.guild.id].dispatcher) {
      client.music[message.guild.id].dispatcher.destroy();
    };
    client.music[message.guild.id].dispatcher =
      await client.music[message.guild.id].connection
          .play(client.kpop.broadcast);
    client.music[message.guild.id].broadcast = true;
    client.music[message.guild.id].type = 'kpop';
    message.channel.send({
      embed: {
        description: `Je joue actuellement ${client.kpop.data.song.title}`,
        thumbnail: {
          url: `https://cdn.listen.moe/covers/${client.kpop.data.song.albums[0]?
          client.kpop.data.song.albums[0].image :
        ''}`,
        },
      },
    });
  };
  if (command === 'help') {
    return message.channel.send(`
    % Liste des commandes %
    () -> arguments facultatif
    [] -> arguments obligatoire
    | -> ou
    > -> arguments secondaire

    play  :: (url | titre) -> Joue de la musique
    destroy :: () -> Arrête de joué de la musique
    leave :: () -> quitte le salon
    loop :: ('on' | 'once' | 'off') -> Répete la musique
    muteindicator :: () -> Arrête d'envoyer des messages à chaque fin de musique
    nowplaying :: () -> Affiche les informations de la musique joué
    pause :: () -> Met en pause la musique
    queue :: (clear > ['all' | nombre]) -> affiche la playlist
    resume :: () -> Reprend la musique
    skip :: () -> Passe à la musique suivante
    skipto :: [nombre] -> Passe à la musique selectionné
    volume :: (nombre) -> affiche ou change le volume
    jpop :: () -> Radio jpop by listen.moe
    kpop :: () -> Radio kpop by listen.moe
    `, {code: 'autohotkey'});
  }
});

/**
 * Check if user has permissions to execute music command
 * @param {Message} message
 * @return {boolean}
 */
function hasPermission(message) {
  if (!message.guild.me.voice.channel) return true;
  if (message.member.hasPermission(['ADMINISTRATOR'],
      {checkAdmin: true, checkOwner: true})) return true;
  if (message.member.roles.cache.some((r) => r.name === 'dj')) return true;
  if (message.guild.me.voice.channel.members.size < 2) return true;
  return false;
};

/**
 * init queue if is not initied
 * @param {Message} message
 * @return {object}
 */
function initMusic(message) {
  if (!client.music[message.guild.id]) {
    return client.music[message.guild.id] = {
      queue: [],
      isPlaying: false,
      broadcast: null,
      connection: null,
      dispatcher: null,
      index: 0,
      volume: 50,
      muteIndicator: false,
      loop: 'off',
      type: null,
    };
  } else return client.music[message.guild.id];
};

/**
 * Get music data
 * @param {Array<string>} args
 * @return {Array<object>}
 */
async function getMusic(args) {
  return await axios({url: `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURI(args.join(' '))}&type=video&key=${credentials.YOUTUBE_TOKEN}`})
      .then((response) => response.data).catch((error) => error);
};

/**
   * play song
   * @param {Message} message - message
   * @return {*}
   */
async function play(message) {
  if (!client.music[message.guild.id].queue ||
    client.music[message.guild.id].queue.length < 1) {
    return message.channel.send('Il n\'y a pas de musique dans la playlist');
  };
  client.music[message.guild.id].dispatcher =
  client.music[message.guild.id].connection.play(
      await ytdl(`https://www.youtube.com/watch?v=${
        client.music[message.guild.id].queue[
            client.music[message.guild.id].index].id.videoId}`, {
        filter: 'audioonly',
        highWaterMark: 20,
        quality: 'highestaudio',
      }, {
        volume: client.music[message.guild.id].volume/100,
        fec: true,
        bitrate: 96,
        highWaterMark: 20,
      }),
  );
  client.music[message.guild.id].type = 'player';
  client.music[message.guild.id].connection.voice.setSelfDeaf(true);
  client.music[message.guild.id].connection.voice.setSelfMute(false);
  client.music[message.guild.id].broadcast = false;
  if (!client.music[message.guild.id].muteIndicator) {
    message.channel.send({
      embed: {
        title: 'Musique joué',
        description: client.music[message.guild.id].queue[
            client.music[message.guild.id].index].snippet.title,
        thumbnail: {
          url: client.music[message.guild.id].queue[
              client.music[
                  message.guild.id].index].snippet.thumbnails.default.url,
        },
      },
    });
  } else {
    message.react('👌');
  };
  client.music[message.guild.id]
      .dispatcher.on('finish', async () => {
        client.music[message.guild.id].dispatcher = null;
        if (client.music[message.guild.id].loop === 'off' &&
        client.music[message.guild.id].queue.length !== 0) {
          client.music[message.guild.id].queue.shift();
          if (client.music[message.guild.id].queue.length === 0) {
            return message.channel
                .send('Il n\'y a plus de musique dans la playlist');
          };
          client.music[message.guild.id].index = 0;
          play(message);
        } else if (client.music[message.guild.id].loop === 'on') {
          if (client.music[message.guild.id].index ===
            client.music[message.guild.id].queue.length - 1) {
            client.music[message.guild.id].index = 0;
          } else {
            client.music[message.guild.id].index++;
          };
          play(message);
        } else if (client.music[message.guild.id].queu === 'once') {
          play(message);
          client.music[message.guild.id].index =
            client.music[message.guild.id].index;
        };
      });
  let r;
  client.music[message.guild.id].dispatcher.on('speaking', (s) => {
    if (s === r) return;
    r=s;
    client.music[message.guild.id].isPlaying = s;
  });
  client.music[message.guild.id].dispatcher.on('error',
      async (err) => {
        console.error(err);
        play(message);
        return message.channel.send(err, {code: 'js'});
      });
};

/**
   * convert seconde to minute
   * @param {Number} ms - seconde
   * @return {Number}
   */
function convert(ms) {
  const data = new Date(ms);
  return {
    seconds: data.getSeconds(),
    minutes: data.getMinutes(),
  };
};

client.login(credentials.DISCORD_TOKEN);

client.on('error', console.error);
client.on('warn', console.warn);

client.jpop.ws.connect();
client.jpop.ws.on('event', (data) => client.jpop.data = data);
client.jpop.ws.on('open', () => console.log('Jpop broadcast connected'));
client.jpop.ws.on('close', () => console.log('Jpop broadcast disconnected'));

client.kpop.ws.connect();
client.kpop.ws.on('event', (data) => client.kpop.data = data);
client.kpop.ws.on('open', () => console.log('Kpop broadcast connected'));
client.kpop.ws.on('close', () => console.log('Kpop broadcast disconnected'));

process.on('uncaughtException', console.warn);
process.on('unhandledRejection', console.warn);
process.on('rejectionHandled', console.warn);
process.on('warning', console.warn);
