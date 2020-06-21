'use strict';
const corePlayer = require('./../../core/player');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'loop',
    description: 'Set loop stream',
    usage: 'loop (on | once | off)',
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
                required: `Require {{mustVote}} votes for loop stream`,
                complete: `Vote completed, you loop stream`,
                content: `Vote {{haveVoted}}/{{mustVote}}`,
            });
            if (call) {
                if (!player.dispatcher) return message.channel.send(`I don't play a music`);
                switch (args.join('')) {
                    case 'off':
                        player.loop = 'off';
                        message.react('➡️');
                        break;
                    case 'on':
                        player.loop = 'on';
                        message.react('🔁');
                        break;
                    case 'once':
                        player.loop = 'once';
                        message.react('🔂');
                        break;
                    default:
                        if (player.loop === 'off') {
                            player.loop = 'on';
                            message.react('🔁');
                        } else if (player.loop === 'on') {
                            player.loop = 'once';
                            message.react('🔂');
                        } else if (player.loop === 'once') {
                            player.loop = 'off';
                            message.react('➡️');
                        };
                        break;
                };
            } else {
                return message.channel.send(`You don't skip music`);
            };
        } else {
            switch (args.join('')) {
                case 'off':
                    player.loop = 'off';
                    message.react('➡️');
                    break;
                case 'on':
                    player.loop = 'on';
                    message.react('🔁');
                    break;
                case 'once':
                    player.loop = 'once';
                    message.react('🔂');
                    break;
                default:
                    if (player.loop === 'off') {
                        player.loop = 'on';
                        message.react('🔁');
                    } else if (player.loop === 'on') {
                        player.loop = 'once';
                        message.react('🔂');
                    } else if (player.loop === 'once') {
                        player.loop = 'off';
                        message.react('➡️');
                    };
                    break;
            };
        };
    },
};
