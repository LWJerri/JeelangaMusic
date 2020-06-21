'use strict';
const corePlayer = require('./../../core/player');
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'leave',
    description: 'Leave bot from channel',
    usage: 'leave',
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
        if (!corePlayer.hasPermission(client, message)) {
            const call = await corePlayer.callRequest(message, new MessageEmbed(), {
                required: `Require {{mustVote}} votes for seek the stream`,
                complete: `Vote completed, you seek the stream`,
                content: `Vote {{haveVoted}}/{{mustVote}}`,
            });
            if (call) {
                message.member.voice.channel.leave();
            } else {
                return message.channel.send(`You don't leave bot from channel`);
            };
        } else {
            message.member.voice.channel.leave();
        };
    },
};
