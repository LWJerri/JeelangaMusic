'use strict';
const corePlayer = require('./../../core/player');
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'remove',
    description: 'Remove a song to playlist',
    usage: 'remove [number]',
    aliases: [],
    category: 'music',
    botPerm: ['MANAGE_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
    userPerm: [],
    admin: false,
    nsfw: false,
    guildOnly: true,
    enabled: true,
    execute: async function(client, message, args) {
        if (!message.member.voice.channel) return message.reply('💢');
        const player = corePlayer.initPlayer(client, message.guild.id);
        if (!player.dispatcher) return message.channel.send(`I don't play a music`);
        if (!args.join('') || isNaN(args.join(''))) {
            return message.channel.send(`You must enter a number value !`);
        };
        if (args.join('') > player.queue.length - 1) return message.react('💢');
        if (!corePlayer.hasPermission(client, message)) {
            const call = await corePlayer.callRequest(message, new MessageEmbed(), {
                required: `Require {{mustVote}} votes for remove ${player.queue[args.join('')].snippet.title}`,
                complete: `Vote completed, you remove ${player.queue[args.join('')].snippet.title} from the playlist`,
                content: `Vote {{haveVoted}}/{{mustVote}}`,
            });
            if (call) {
                if (!player.dispatcher) return message.channel.send(`I don't play a music`);
                if (player.index > args.join('')) player.index--;
                player.queue.splice(args.join('', 1));
            } else {
                return message.channel.send(`You don't set stream to resume`);
            };
        } else {
            if (player.index > args.join('')) player.index--;
            player.queue.splice(args.join('', 1));
        };
    },
};
