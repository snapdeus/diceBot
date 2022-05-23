const Discord = require('discord.js')
const db = require('quick.db')

const { breads } = require('../resources/breads')

module.exports = {
    name: 'bag',
    description: 'displays bag',
    async execute(client, message, args) {
        let user = message.author.id
        let username = message.author.username

        const bag = new db.table('bag')
        const dbHasBag = bag.has(`${ user }`)
        if (!dbHasBag) {
            bag.set(`${ user }.bread`, [])

        }

        const userBag = bag.get(`${ user }.bread`)


        const filterObjectArray = (arr, filterArr) => (
            arr.filter(el =>
                filterArr.some(f =>
                    f === el.breadId
                )
            )
        );

        const breadsInBag = filterObjectArray(breads, userBag)


        let breadsString = ''
        let array = [];
        for (let bread of breadsInBag) {

            array.push(bread.Name)

        }

        let rank = await client.leveling.getUserLevel(user, message.guild.id, username)


        breadsString = array.join(', ')
        console.log(breadsString)
        const embed = new Discord.MessageEmbed()
            .setThumbnail('https://i.imgur.com/hAnfQUZ.png')
            .setTitle(`${ username }'s Bag`)
            .setFooter({ text: `Current Balance: 🪙 ${ rank.XPoverTime }`, iconURL: message.author.displayAvatarURL() })
        if (array.length !== 0) {
            embed.addField('Breads: ', `${ breadsString }`)
        }

        message.channel.send({ embeds: [embed] })




    }
}

