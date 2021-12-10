require('dotenv').config();

module.exports = {
    name: 'mpcheck',
    description: 'this command shows guild bank items',
    async execute(client, message, args, Discord) {
        if(!args[0]) return message.channel.send('Enter username');
        if(!args[1]) return message.channel.send('Enter a platform');

        let
    }
}