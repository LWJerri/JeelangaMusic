'use strict';
const corePlayer = require('./../../core/player');
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'resume',
    description: 'Set stream to resume',
    usage: 'resume',
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
        if (!corePlayer.hasPermission(client, message)) {
            const call = await corePlayer.callRequest(message, new MessageEmbed(), {
                required: `Require {{mustVote}} votes for set resume the stream`,
                complete: `Vote completed, you set resume the stream`,
                content: `Vote {{haveVoted}}/{{mustVote}}`,
            });
            if (call) {
                if (!player.dispatcher) return message.channel.send(`I don't play a music`);
                player.dispatcher.resume();
            } else {
                return message.channel.send(`You don't set stream to resume`);
            };
        } else {
            player.dispatcher.resume();
        };
    },
};
