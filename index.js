'use strict';
const {Client, Collection} = require('discord.js');
const klaw = require('klaw');
const {sep, resolve, parse} = require('path');
const credentials = require('./credentials');
const client = new Client();

client.commands = new Collection();
client.aliases = new Collection();
client.music = {};
client.config = require('./config');

require('./server/app')(client);

function loadCommand(commandPath) {
    try {
        const command = require(commandPath);
        client.commands.set(command.name.trim().toLowerCase(), command);
        command.aliases.forEach((alias) => {
            client.aliases.set(alias, command.name);
        });
        console.log(`Command ${command.name} loaded !`);
    } catch (error) {
        console.error(error);
    };
};

function loadEvent(eventPath) {
    try {
        const event = require(eventPath);
        client.on(event.name.trim(), (...args) => event.execute(client, ...args));
        console.log(`Command ${event.name} loaded !`);
    } catch (error) {
        console.error(error);
    };
};

klaw(resolve(__dirname, 'commands')).on('data', (item) => {
    const cmdFile = parse(item.path);
    if (!cmdFile.ext || cmdFile.ext !== '.js') return;
    loadCommand(
        `${cmdFile.dir}${sep}${cmdFile.name}${cmdFile.ext}`,
    );
});

klaw(resolve(__dirname, 'events')).on('data', (item) => {
    const cmdFile = parse(item.path);
    if (!cmdFile.ext || cmdFile.ext !== '.js') return;
    loadEvent(
        `${cmdFile.dir}${sep}${cmdFile.name}${cmdFile.ext}`,
    );
});

client.login(credentials.DISCORD_TOKEN); // token is in process.env.DISCORD_TOKEN
