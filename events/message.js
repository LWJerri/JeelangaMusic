'use strict';

const { Message } = require("discord.js");

module.exports = {
    name: 'message',
    /**
     * Execute event
     * @param {Client} client 
     * @param {Message} message
     * @return {Promise<Message>|null}
     */
    execute: function (client, message) {
        if (message.author.bot || message.system) return null;
        if (!message.content.startsWith(client.config.prefix)) return null;
        const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
        if (!cmd) return null;
        if (!message.guild && cmd.guildOnly) {
            return message.channel.send(`This command is only available in a guild`);
        };
        if (message.guild && !message.channel.permissionsFor(message.guild.me).has(cmd.botPerm, {checkAdmin: true})) {
           return message.reply(`I need \`${cmd.botPerm.join('`, `')}\` permissions for work correctly`);
        };
        if (message.guild && message.guild.ownerID !== message.member.id && !message.channel.permissionsFor(message.member).has(cmd.userPerm, {checkAdmin: true})) {
           return message.reply(`You need \`${cmd.userPerm.join('`, `')}\` for this command`);
        };
        if (!cmd.enabled) {
            return message.channel.send('This command is disabled');
        };
        cmd.execute(client, message, args);
    },
};
