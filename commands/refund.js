const Discord = require('discord.js')

module.exports = {
    name: "refund",

    async execute(client, message, args) {
        if (!message.member.permissions.has("ADMINISTRATOR")) {
            return message.channel.send("NO. **You can not use this command | Permission: ADMINISTRATOR**");
        }
        const user = message.mentions.members.first();

        if (!user) {
            return message.channel.send("**Please mention the user for refund**");
        }
        if (user.id === message.author.id) {
            return message.channel.send("**I can't refund you because you are the Admin and that would immoral**");
        }

        let refund = parseInt(args.slice(1))

        if (!refund || isNaN(refund)) {
            return message.channel.send("**Please give some number amount for refund** ");
        }


        let userId = user.id
        let username = message.mentions.users.first().username
        let guild = message.guild.id
        let rank = await client.leveling.getUserLevel(userId, guild, username)


        client.leveling.addXPoverTime(userId, guild, refund)

        rank = await client.leveling.getUserLevel(userId, guild, username)

        const embed = new Discord.MessageEmbed()
            .setTitle('Administrator Refund')
            .addField('Username:', `**${ message.mentions.users.first().username }**`)
            .addField('Refund Amount:', `🪙 ${ refund }`)
            .addField('Refunded by', `**${ message.author }**`)
            .addField('New Total Balance: ', `🪙 ${ rank.XPoverTime }`)

        message.channel.send({ embeds: [embed] })


    }
}