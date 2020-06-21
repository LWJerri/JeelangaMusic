'use strict';
const corePlayer = require('./../../core/player');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'skip',
    description: 'Skip music',
    usage: 'skip',
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
        if (!corePlayer.hasPermission(client, message)) {
            const call = await corePlayer.callRequest(message, new MessageEmbed(), {
                required: `Require {{mustVote}} votes for skip this music`,
                complete: `Vote completed, you skip this music`,
                content: `Vote {{haveVoted}}/{{mustVote}}`,
            });
            if (call) {
                if (!player.dispatcher) return message.channel.send(`I don't play a music`);
                switch (player.loop) {
                    case 'off':
                        player.queue.shift();
                        corePlayer.play(client, message);
                        break;
                    default:
                        await player.dispatcher.destroy();
                        if (player.index === player.queue.length - 1) {
                            player.index = 0;
                        } else {
                            player.index++;
                        };
                        player.play(message, guildPlayer, guild);
                        break;
                }
            } else {
                return message.channel.send(`You don't skip music`);
            };
        } else {
            switch (player.loop) {
                case 'off':
                    player.queue.shift();
                    corePlayer.play(client, message);
                    break;
                default:
                    await player.dispatcher.destroy();
                    if (player.index === player.queue.length - 1) {
                        player.index = 0;
                    } else {
                        player.index++;
                    };
                    player.play(message, guildPlayer, guild);
                    break;
            }
        };
    },
};
