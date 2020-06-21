'use strict';
const corePlayer = require('./../../core/player');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'queue',
    description: 'Display the queue',
    usage: 'queue',
    aliases: [],
    category: 'music',
    botPerm: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
    userPerm: [],
    admin: false,
    nsfw: false,
    guildOnly: true,
    enabled: true,
    execute: async function (client, message, args) {
        const player = corePlayer.initPlayer(client, message.guild.id);
        if (!player.queue || player.queue.length <= 0) return message.channel.send(`The queue is empty`);
        let totalTime = 0;
        player.queue.map(v => totalTime = totalTime + v.time/1000);
        const queueEmbed = new MessageEmbed()
            .setTitle(`${message.guild.name} queue`)
            .setDescription(player.queue.map((v, i) => `[${i+1}] ${v.snippet.title} - request by ${v.request}`))
            .addField('Playlist time', `${corePlayer.parseSeconde(totalTime)}`);
        message.channel.send({embed: queueEmbed});        
    },
};
