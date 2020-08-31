'use strict';
const corePlayer = require('./../../core/player');
const htmlEntitiesDecoder = require('html-entities-decoder');
const {MessageEmbed, MessageCollector} = require('discord.js');
const ytdl = require('ytdl-core');

/**
 * @typedef snippetObject
 * 
 * @property {string} publishedAt
 * @property {string} channelId
 * @property {string} title
 * @property {string} description
 * @property {{default: {url: string}, medium: {url: string}, high: {url: string}}} thumbnails
 * @property {string} channelTitle
 * @property {string} liveBroadcastContent
 * @property {string} publishTime
 */

/**
 * @typedef idObject
 * 
 * @property {string} kind
 * @property {string} videoId
 */

/**
 * @typedef SongObject
 * 
 * @property {string} kind
 * @property {string} etag
 * @property {{kind: string, videoId: string}} id
 * @property {snippetObject} snippet
 */

let requestFunc = {};

async function getBasicInfo(args, token) {
  if (!requestFunc[token]) requestFunc[token] = 0;
  if (requestFunc[token] > 5) return 'ERROR';
  requestFunc[token]++;
  return ytdl.getBasicInfo(args).catch(async (err) => {
    await new Promise(resolve => setTimeout(resolve, 250));
    return getBasicInfo(args, token);
  });
};

module.exports = {
    name: 'play',
    description: 'Play a music',
    usage: 'play (url | title)',
    aliases: ['p'],
    category: 'music',
    botPerm: ['CONNECT', 'SPEAK', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
    userPerm: [],
    admin: false,
    nsfw: false,
    guildOnly: true,
    enabled: true,
    execute: async function(client, message, args) {
      if (!message.member.voice.channel) return message.channel.send(`You must connect on the voice channel before !`);

      const player = corePlayer.initPlayer(client, message.guild.id);
      player.connection = await message.member.voice.channel.join();

      if ((!args.join('') && player.queue.length >= 1) && (!player.dispatcher)) return corePlayer.play(client, message);
      else if (!args.join('')) return;

      if (/http(s):\/\/(www.)?(youtube.[a-z]{0,10}\/((watch\?v=[a-zA-Z0-9]{0,50})|(embed\/[a-zA-Z0-9]{0,50})))|(youtu.be\/{0,50})/.test(args.join(''))) {
        /**
         * @type {SongObject}
         */
        const song = {
          kind: 'youtube#searchResult',
          etag: undefined,
          id: {
            kind: 'youtube#video',
          },
          snippet: {
            thumbnails: {
              default: {},
              medium: {},
              high: {},
            },
          },
        };
        const songData = await getBasicInfo(args.join(''), message.id);
        delete requestFunc[message.id];

        if (songData == 'ERROR') return message.channel.send('I can\'t play this song');

        song.id.videoId = songData.video_id;
        song.snippet.publishedAt = songData.published;
        song.snippet.channelId = songData.author.id;
        song.snippet.title = songData.title;
        song.snippet.description = songData.description;
        song.snippet.thumbnails.default.url = songData.thumbnail_url;
        song.snippet.thumbnails.medium.url = songData.thumbnail_url;
        song.snippet.thumbnails.high.url = songData.thumbnail_url;
        song.snippet.channelTitle = songData.author.user;
        song.snippet.liveBroadcastContent = undefined;
        song.snippet.publishTime = undefined;
        song.time = songData.length_seconds*1000;
        song.request = message.member;

        player.queue.push(song);
        player.type = 'player';
        let allTime = 0;
        player.queue.map(v => allTime = allTime + v.time/1000);
        const addQueueEmbed = new MessageEmbed()
            .setTitle(`Add music in playlist`)
            .setDescription(song.snippet.title)
            .addFields(
                {name: 'Song time', value: `${corePlayer.parseSeconde(song.time/1000)}`, inline: true},
                {name: 'Playlist time', value: `${corePlayer.parseSeconde(allTime)}`, inline: true},
            )
            .setThumbnail(song.snippet.thumbnails.high.url);
        message.channel.send({embed: addQueueEmbed});
        if (player.queue.length > 1) {
          if (!player.dispatcher) {
              corePlayer.play(client, message);
          };
        } else {
          if (player.queue.length <= 1) {
            player.index = 0;
          };
          corePlayer.play(client, message);
        };
        return;
      };

      const youtube = await corePlayer.getSongs(args.join(' '));
      if (youtube.error) return message.channel.send(youtube.error.message, {code: 'js'});
      if (youtube.isAxiosError) {
        /**
         * node v14 youtube?.response?.data?.error?.status
         */
        return message.channel.send(youtube.response ? youtube.response.data ? youtube.response.data.error ? youtube.response.data.error.status : 'undefined' : 'undefined' : 'undefined', {code: 'js'});
      };


      if (youtube.items.length < 1) {
        return message.channel.send('No tracks found !');
      };

      for (const key in youtube.items) {
        youtube.items[key].snippet.title = htmlEntitiesDecoder(youtube.items[key].snippet.title);
      };

      const listEmbed = new MessageEmbed()
        .setTitle(`here is music list`)
        .setDescription(youtube.items.map((v, i) => `[${i+1}] ${v.snippet.title}`).join('\n'))
        .setTimestamp(Date.now())
        .setFooter(`Entre \`cancel\` for exit selection`);
      message.channel.send({embed: listEmbed}).then((msg) => {
        const filter = (msg) => msg.author.id === message.author.id;
        const collector = new MessageCollector(message.channel, filter, {
          time: 20000,
        });
        collector.on('collect', async (msgCollected) => {
          const choice = msgCollected.content.trim().split(/ +/g)[0];
          if (choice.toLowerCase() === 'cancel') {
            return collector.stop('STOPPED');
          };
          if (!choice || isNaN(choice)) {
            return message.channel.send(`Your choice is invalid`);
          };
          if (choice > youtube.items.length || choice <= 0) {
            return message.reply(`Your choice is not finding in the selection`);
          };
          const song = youtube.items[choice - 1];
          collector.stop('PLAY');
          msg.delete().catch((err) => {/*Message already deleted*/});
          msgCollected.delete().catch((err) => {/*Message already deleted*/});
          if (song.id.kind === 'youtube#channel') {
            return message.channel.send(`I can't play a video with a channel`);
          };
          const info = await ytdl.getBasicInfo(`https://www.youtube.com/watch?v=${song.id.videoId}`);
          song.time = JSON.parse(JSON.stringify(info)).length_seconds*1000;
          song.request = message.member;
          player.queue.push(song);
          player.type = 'player';
          let allTime = 0;
          player.queue.map(v => allTime = allTime + v.time/1000);
          const addQueueEmbed = new MessageEmbed()
              .setTitle(`Add music in playlist`)
              .setDescription(song.snippet.title)
              .addFields(
                  {name: 'Song time', value: `${corePlayer.parseSeconde(song.time/1000)}`, inline: true},
                  {name: 'Playlist time', value: `${corePlayer.parseSeconde(allTime)}`, inline: true},
              )
              .setThumbnail(song.snippet.thumbnails.high.url);
          message.channel.send({embed: addQueueEmbed});
          if (player.queue.length > 1) {
            if (!player.dispatcher) {
                corePlayer.play(client, message);
            };
          } else {
            if (player.queue.length <= 1) {
              player.index = 0;
            };
            corePlayer.play(client, message);
          };
        });
        collector.on('end', (collected, reason) => {
          if (reason === 'STOPPED') {
            return message.reply('You have cancelled the selection');
          } else if (reason === 'PLAY') {
            return false;
          } else {
            return message.reply('Do you not have select a song');
          };
        });
      });
    },
};
