const Discord = require('discord.js');
require('dotenv').config();

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const prefix = process.env.PREFIX;
const fs = require('fs');
const { CLIENT_RENEG_WINDOW } = require('tls');

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('js'));
for(const file of commandFiles)
{
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('WoW Guild Bank Online');
});

client.on('messageCreate', message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if(command === 'ping')
    {
        client.commands.get('ping').execute(message, args);
    }

    if(command === 'gb' || command === 'guildbank')
    {
        client.commands.get('guildbank').execute(message, args, Discord);
    }

    if(command === 'add')
    {
        client.commands.get('additems').execute(message, args);
    }

    if(command === 'remove')
    {
        client.commands.get('removeitems').execute(message, args);
    }

    if(command === 'crit' || command === 'critical')
    {
        client.commands.get('setcritical').execute(message, args);
    }

    if(command === 'low')
    {
        client.commands.get('lowitems').execute(message, args, Discord);
    }
});

client.login(process.env.token);