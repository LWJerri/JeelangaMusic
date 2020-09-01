'use strict';
const corePlayer = require('./../../core/player');
const { MessageEmbed, Client, Message } = require('discord.js');

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
    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @param {string[]} args 
     */
    execute: async function (client, message, args) {
        const player = corePlayer.initPlayer(client, message.guild.id);
        if (!player.queue || player.queue.length <= 0) return message.channel.send(`The queue is empty`);
        let totalTime = 0;
        player.queue.map(v => totalTime = totalTime + v.time / 1000);

        const packet = [];
        let i = 0;

        let _i = 0;

        for (const song of player.queue) {
            song.i = _i;
            _i++;
            if (packet.length < 1) {
                packet.push([song]);
            } else {
                if ((packet[i].map((v, i) => `[${i + 1}] ${v.snippet.title} - request by ${v.request}`).join('\n') + `[0] ${song.snippet.title} - request by ${song.request}`).length >= 2048) {
                    i++;
                    packet.push([song]);
                } else {
                    packet[i].push(song);
                };
            };
        };

        let index = 0;

        const des = (_index = index) => packet[_index].map((v) => `[${v.i + 1}] ${v.snippet.title} - request by ${v.request}`).join('\n')

        const msg = await message.channel.send({
            embed: new MessageEmbed()
                .setTitle(`${message.guild.name} queue`)
                .setDescription(des(index))
                .addField('Playlist time', `${corePlayer.parseSeconde(totalTime)}`)
        });

        if (packet.length > 1) {
            await msg.react('◀️');
            await msg.react('▶️');
    
            const filter = (reaction, user) => (reaction.emoji.name === '◀️' || reaction.emoji.name === '▶️') && !user.bot;
    
            const collector = msg.createReactionCollector(filter, { time: 1000 * 60 * 5 });
    
            const collectFunc = (reaction) => {
                if (reaction.emoji.name === '◀️') {
                    if (index <= 0) index = packet.length-1;
                    else index--;
                    console.log(index);
                    msg.edit({
                        embed: new MessageEmbed()
                            .setTitle(`${message.guild.name} queue`)
                            .setDescription(des(index))
                            .addField('Playlist time', `${corePlayer.parseSeconde(totalTime)}`)
                    });
                } else {
                    if (index >= packet.length-1) index = 0;
                    else index++;
                    console.log(index);
                    msg.edit({
                        embed: new MessageEmbed()
                            .setTitle(`${message.guild.name} queue`)
                            .setDescription(des(index))
                            .addField('Playlist time', `${corePlayer.parseSeconde(totalTime)}`)
                    });
                };
            };
    
            collector.on('collect', collectFunc);
    
            collector.once('end', () => {
                collector.removeAllListeners();
            });
        };
    },
};
