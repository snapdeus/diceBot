const Discord = require('discord.js')

module.exports = {
    name: 'rank',
    description: 'displays rank',
    async execute(client, message, args) {
        let user = message.author.id
        let username = message.author.username

        let rank = await client.leveling.getUserLevel(user, message.guild.id, username)

        const embed = new Discord.MessageEmbed()
            .setThumbnail(message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
            .setTitle(`${ message.author.username } Stats`)
            .addField('Level: ', `${ rank.level }`)
            .addField('XP: ', `${ rank.xp }`)
            .addField('Total XP needed to level up:', `${ rank.nextLevel }`)

        message.channel.send({ embeds: [embed] })

        // message.channel.send(`<@${ user }> level: ${ rank.level }  xp: ${ rank.xp } xp to next level: ${ rank.nextLevel } `)


    }
}

