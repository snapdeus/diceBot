const { Client: DiscordClient, Intents } = require('discord.js')
const client = new DiscordClient({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
})
const { EasyLeveling } = require('../index.js')
const config = require('./config.json')
const options = {
    startingXP: 1,
    startingLevel: 1,
    levelUpXP: 10,
    database: 'sqlite',
    cooldown: 1000,
    diceCooldown: 1000
}

const fs = require('fs')
const Discord = require('discord.js')
const path = require('path');
const dirPath = path.resolve(__dirname, '../commands');


client.commands = new Discord.Collection();


const commandFiles = fs.readdirSync(`${ dirPath }`).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`${ dirPath }/${ file }`);
    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}


client.leveling = new EasyLeveling(client, options)
client.on('ready', () => {
    console.log(client.user.tag + ' is ready!')
})
    .on('messageCreate', (message) => {
        if (message.author.bot) return




        //command handler (set prefix in config.json)
        if (!message.content.startsWith(config.PREFIX)) {
            client.leveling.addLevels(message.author.id, message.guild.id, message.channel.id, message.createdTimestamp, message.author.username, message.author)
            return;
        }

        const args = message.content.slice(config.PREFIX.length).trim().split(' ');
        const commandName = args.shift().toLowerCase();

        if (!client.commands.has(commandName)) return;
        const command = client.commands.get(commandName);
        try {
            if (command.name === 'roll' && message.channel.id !== config.TESTXPCHANNEL) {
                message.channel.send('Please play dice in the dice channel.')
                return
            }
            // console.log(command)
            command.execute(client, message, args);
        } catch (error) {
            console.error(error);
            message.reply('there was an error trying to execute that command!');
        }

    })
client.leveling.on('UserLevelUp', (newLevel, lastLevel, userId, guildId, channelId, username, author) => {
    const embed = new Discord.MessageEmbed()
        .setThumbnail(author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
        .setTitle('LEVEL UP!')
        .setDescription(`Congrats <@${ userId }>! You have advanced to level ${ newLevel }. Your old level was level ${ lastLevel }`)
        .setColor('RED')
    client.channels.cache.get(config.TESTXPCHANNEL).send({ embeds: [embed] })
})
client.leveling.on('cooldownActive', (channelId, userId) => {
    client.channels.cache.get(config.TESTXPCHANNEL).send(`Cooldown is still active, <@${ userId }>.  You'll get more XP in ${ options.cooldown / 1000 } seconds.`)
})
client.leveling.on('diceCooldownActive', (channelId, userId) => {
    client.channels.cache.get(config.TESTXPCHANNEL).send(`Cooldown is still active, <@${ userId }>.  Roll again in ${ options.diceCooldown / 1000 } seconds.`)
})
client.leveling.on('error', (e, functionName) => {
    console.log(`An error occured at the function ${ functionName }. The error is as follows`)
    console.log(e)
})
client.login(config.TESTTOKEN)