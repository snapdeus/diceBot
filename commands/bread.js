const axios = require('axios')
const { breads } = require('../resources/breads')
const Discord = require('discord.js')

module.exports = {
    name: 'bread',
    description: 'replies with bread',
    async execute(client, message, args) {
        let user = message.author.id
        let username = message.author.username
        let guild = message.guild.id
        let rank = await client.leveling.getUserLevel(user, guild, username)
        if (rank.XPoverTime < 35) {
            const embed = new Discord.MessageEmbed()
                .setTitle("Insufficient Funds")
                .addField('You do not have: ', `🪙 35 Haus Coin`)
                .addField(`Remaining Funds for ${ username }: `, `🪙 ${ rank.XPoverTime } Haus Coin`)

            message.channel.send({ embeds: [embed] })
            return
        }

        let bread = breads[(Math.floor(Math.random() * breads.length))]

        client.leveling.reduceXPoverTime(user, guild, 35)

        rank = await client.leveling.getUserLevel(user, guild, username)

        const embed = new Discord.MessageEmbed()
            .setThumbnail(bread.Image)
            .setTitle(bread.Name)
            .setDescription(bread.Description)
            .addField('Type: ', `${ bread.Type }`)
            .addField('Origin: ', `${ bread.Origin }`)
            .addField('You have been debited: ', `🪙 35`)
            .addField(`Remaining Funds for ${ username }: `, `🪙 ${ rank.XPoverTime } Haus Coin`)

        message.channel.send({ embeds: [embed] })

    }
}

