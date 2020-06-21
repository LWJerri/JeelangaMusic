'use strict';
const corePlayer = require('./../../core/player');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'volume',
    description: 'set volume',
    usage: 'volume [number]',
    aliases: [],
    category: 'music',
    botPerm: ['MANAGE_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
    userPerm: [],
    admin: false,
    nsfw: false,
    guildOnly: true,
    enabled: true,
    execute: async function (client, message, args) {
        if (!message.member.voice.channel) return message.reply('💢');
        const player = corePlayer.initPlayer(client, message.guild.id);
        if (!player.dispatcher) return message.channel.send(`I don't play a music`);
        if (!args.join('') || isNaN(args.join(''))) {
            return message.channel.send(`You must enter a number value !`);
        };
        if (!corePlayer.hasPermission(client, message)) {
            const call = await corePlayer.callRequest(message, new MessageEmbed(), {
                required: `Require {{mustVote}} votes for set volume`,
                complete: `Vote completed, you set volume`,
                content: `Vote {{haveVoted}}/{{mustVote}}`,
            });
            if (call) {
                if (!player.dispatcher) return message.channel.send(`I don't play a music`);
                player.dispatcher.setVolume(args.join('')/100);
            } else {
                return message.channel.send(`You don't skip music`);
            };
        } else {
            player.dispatcher.setVolume(args.join('')/100);
        };
    },
};
