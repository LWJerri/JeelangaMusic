'use strict';
const corePlayer = require('./../../core/player');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const {split} = require('./../../util/Util');

module.exports = {
    name: 'nowplaying',
    description: 'Destroy and reset the stream',
    usage: 'destroy',
    aliases: ['nowplay', 'np'],
    category: 'music',
    botPerm: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
    userPerm: [],
    admin: false,
    nsfw: false,
    guildOnly: true,
    enabled: true,
    execute: async function (client, message, args) {
        const player = corePlayer.initPlayer(client, message.guild.id);
        if (!player.dispatcher) return message.channel.send(`I don't play a music`);
        const duration = moment.duration({ms: player.queue[player.index].time});
        const progress = moment.duration({ms: player.dispatcher.streamTime});
        const progressBar = ['▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬'];
        const calcul = Math.round(progressBar.length * (player.dispatcher.streamTime/ (player.queue[player.index].time)));
        progressBar[calcul] = '🔘';
        const npEmbed = new MessageEmbed()
            .setTitle('Now playing')
            .setDescription(`${split(player.queue[player.index].snippet.description, 1000)}\n[${player.queue[player.index].snippet.title}](https://www.youtube.com/watch?v=${player.queue[player.index].id.videoId})`)
            .setThumbnail(player.queue[player.index].snippet.thumbnails.high.url)
            .addField('Duration', '[`' + progress.minutes() + ':' + progress.seconds() + '`] ' + progressBar.join('') + ' [`' + duration.minutes() + ':' + duration.seconds() + '`]')
        message.channel.send({embed: npEmbed});
    },
};
