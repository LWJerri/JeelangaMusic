'use strict';
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'help',
    description: 'display commands',
    usage: 'help',
    category: 'util',
    aliases: ['h'],
    botPerm: ['MANAGE_MESSAGES', 'EMBED_LINKS'],
    userPerm: [],
    admin: false,
    nsfw: false,
    guildOnly: true,
    enabled: true,
    execute: async function (client, message, args) {
        const commands = client.commands;
        const cmd = {};
        for (const key of commands.filter(command => command.enabled)) {
            if (!cmd[key[1].category]) {
                cmd[key[1].category] = [];
            };
            cmd[key[1].category].push(key[1]);
        };
        const helpEmbed = new MessageEmbed()
            .setTitle('Command help')
            .setAuthor(message.author.username, message.author.displayAvatarURL())
            .setTimestamp(Date.now())
            .setFooter(client.user.username, client.user.displayAvatarURL());
            
        for (const key in cmd) {
            helpEmbed.addField(`**${cmd[key].length} · ${key}**`, cmd[key].map((v) => `\`${v.name}\``).join(', '), true);
        };

        message.channel.send({embed: helpEmbed});
    },
};
