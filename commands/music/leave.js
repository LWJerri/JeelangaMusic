'use strict';
const corePlayer = require('../../core/player');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'leave',
    description: 'Leave channel',
    usage: 'leave',
    aliases: [],
    category: 'music',
    botPerm: ['MANAGE_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
    userPerm: [],
    admin: false,
    nsfw: false,
    guildOnly: true,
    enabled: true,
    execute: async function (client, message, args) {
        if (!corePlayer.hasPermission(client, message)) return message.reply('💢');
        const player = corePlayer.initPlayer(client, message.guild.id);
        if (!corePlayer.hasPermission(client, message)) {
            const call = await corePlayer.callRequest(message, new MessageEmbed(), {
                required: `Require {{mustVote}} votes for destroy the stream`,
                complete: `Vote completed, you destroy the stream`,
                content: `Vote {{haveVoted}}/{{mustVote}}`,
            });
            if (call) {
                if (!player.dispatcher) return message.channel.send(`I don't play a music`);
                /**
                 * node V14
                 * player?.dispatcher?.destroy()
                 */
                try {
                    player.dispatcher.destroy();
                } catch (error) {/*No player init*/ };
                try {
                    message.member.voice.channel.leave();
                } catch (error) {/*...*/};

                // grabage collector
                delete client.music[message.guild.id]
            } else {
                return message.channel.send(`You don't destroy the stream`);
            };
        } else {
            /**
             * node V14
             * player?.dispatcher?.destroy()
             */
            try {
                player.dispatcher.destroy();
            } catch (error) {/*No player init*/ };
            try {
                message.member.voice.channel.leave();
            } catch (error) {/*...*/};

            // grabage collector
            delete client.music[message.guild.id];
        };
    },
};
