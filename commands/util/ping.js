'use strict';

module.exports = {
    name: 'ping',
    description: 'Ping the bot',
    usage: 'ping',
    category: 'util',
    aliases: [],
    botPerm: [],
    userPerm: [],
    admin: false,
    nsfw: false,
    guildOnly: false,
    enabled: true,
    execute: function(client, message, args) {
      return message.channel.send(`Pong ! ${client.ws.ping} ms`);
    },
};
