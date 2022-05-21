const Discord = require('discord.js')

module.exports = {
    name: 'leaders',
    description: 'displays leaderboard',
    async execute(client, message, args) {

        let leaderboard = await client.leveling.getTopUser(message.guild.id)

        // console.log(leaderboard)
        const embed = new Discord.MessageEmbed()
            .setTitle('Haus of Decline Leaderboard')
            .setThumbnail(client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
        for (let i = 0; i < leaderboard.length; i++) {

            embed.addField(`${ i + 1 }: ${ leaderboard[i].username }`, `*Level:* ${ leaderboard[i].level } 
            *XP:* ${ leaderboard[i].xp } `)
        }
        message.channel.send({ embeds: [embed] })
    }
}

