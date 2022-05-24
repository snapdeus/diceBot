const Discord = require('discord.js')
const db = require('quick.db')

const { breads } = require('../resources/breads')
const { dairy } = require('../resources/dairy')

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
            bag.set(`${ user }.dairy`, [])
        }

        const userBreadBag = bag.get(`${ user }.bread`)
        const userDairyBag = bag.get(`${ user }.dairy`)

        const filterObjectArray = (arr, filterArr) => (
            arr.filter(el =>
                filterArr.some(f =>

                    f === el.breadId

                )
            )
        );

        const dfilterObjectArray = (arr, filterArr) => (
            arr.filter(el =>
                filterArr.some(f =>

                    f === el.dairyId
                )
            )
        );

        const breadsInBag = filterObjectArray(breads, userBreadBag)
        const dairyInBag = dfilterObjectArray(dairy, userDairyBag)

        let breadsString = ''
        let breadArray = [];
        for (let bread of breadsInBag) {
            breadArray.push(bread.Name)

        }

        let dairyString = ''
        let dairyArray = [];
        for (let dairy of dairyInBag) {
            dairyArray.push(dairy.Name)

        }



        let rank = await client.leveling.getUserLevel(user, message.guild.id, username)


        breadsString = breadArray.join(', ')
        dairyString = dairyArray.join(', ')

        console.log(breadsString)
        console.log(dairyString)

        const embed = new Discord.MessageEmbed()
            .setThumbnail('https://i.imgur.com/hAnfQUZ.png')
            .setTitle(`${ username }'s Bag`)
            .setFooter({ text: `Current Balance: 🪙 ${ rank.XPoverTime }`, iconURL: message.author.displayAvatarURL() })
        if (breadArray.length !== 0) {
            embed.addField('Breads: ', `${ breadsString }`)
        }

        if (dairyArray.length !== 0) {
            embed.addField('Dairy: ', `${ dairyString }`)
        }

        message.channel.send({ embeds: [embed] })




    }
}

