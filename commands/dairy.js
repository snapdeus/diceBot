
const { dairy } = require('../resources/dairy')
const Discord = require('discord.js')
const db = require('quick.db')

module.exports = {
    name: 'dairy',
    description: 'replies with dairy',
    async execute(client, message, args) {

        let user = message.author.id
        let username = message.author.username
        let guild = message.guild.id
        let rank = await client.leveling.getUserLevel(user, guild, username)


        const bag = new db.table('bag')

        const dbHasBag = bag.has(`${ user }`)
        if (!dbHasBag) {
            bag.set(`${ user }.dairy`, [])

        }



        if (rank.XPoverTime < 50) {
            const embed = new Discord.MessageEmbed()
                .setTitle("Insufficient Funds")
                .addField('You do not have: ', ` 50 Haus Coin`)
                .addField(`Remaining Funds for ${ username }: `, `🪙 ${ rank.XPoverTime } Haus Coin`)

            message.channel.send({ embeds: [embed] })
            return
        }

        let dairyItem = dairy[(Math.floor(Math.random() * dairy.length))]

        bag.push(`${ user }.dairy`, dairyItem.dairyId)




        client.leveling.reduceXPoverTime(user, guild, 50)

        rank = await client.leveling.getUserLevel(user, guild, username)

        const embed = new Discord.MessageEmbed()
            .setThumbnail(dairyItem.Image)
            .setTitle(dairyItem.Name)
            .setDescription(dairyItem.Description)
            .addField('Origin: ', `${ dairyItem.Origin }`)
            .addField('You have been debited: ', `🪙 50`)
            .addField(`Remaining Funds for ${ username }: `, `🪙 ${ rank.XPoverTime } Haus Coin`)

        message.channel.send({ embeds: [embed] })

    }
}

