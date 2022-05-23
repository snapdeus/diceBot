const events = require('../src/events/events')
const db = require('quick.db')
const Discord = require('discord.js')


module.exports = {
    name: 'roll',
    description: 'dice game',
    async execute(client, message, args) {
        let player = message.author;
        let username = message.author.username
        let user = message.author.id;
        let guild = message.guild.id;
        let channelId = message.channel.id;
        let timestamp = message.createdTimestamp;
        const dice = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
        const lastMessage = await db.get(`${ user }-${ guild }.timestamp`);

        if (lastMessage !== null && client.leveling.diceCooldown - (Date.now() - lastMessage) > 0) {
            // console.log('cooldown active')
            client.leveling.emit(events.diceCooldownActive, channelId, user)
            return
        }

        const { playerDiceRoll, botDiceRoll } = await client.leveling.rollDice(user, guild, username)

        const userStats = await client.leveling.getUserLevel(user, guild);
        const stakes = userStats.level * 5
        message.channel.send(`Let's begin. The stakes are: ${ stakes } XP...rolling...`)


        if (playerDiceRoll > botDiceRoll) {

            let rank = await client.leveling.getUserLevel(user, guild)
            let curLevelUp = await db.get(`${ user }-${ guild }.nextLevel`)

            //gain level and xp
            if (rank.xp + stakes > curLevelUp) {
                // console.log('xp gain should level up')
                let difference = (rank.xp + stakes) - curLevelUp
                client.leveling.addOneLevel(user, guild, 1)
                client.leveling.addXP(user, guild, difference)

                rank = await client.leveling.getUserLevel(user, guild)
                const nextLevel = 10 * (Math.pow(2, rank.level) - 1)
                await db.set(`${ user }-${ guild }.nextLevel`, nextLevel)
                const embed = new Discord.MessageEmbed()
                    .setThumbnail(player.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))

                    .setTitle('Winner! LEVEL UP!')
                    .setDescription(`${ message.author.username } rolled a ${ dice[playerDiceRoll - 1] } ${ playerDiceRoll } and I rolled a ${ dice[botDiceRoll - 1] } ${ botDiceRoll }.  ${ message.author.username } won ${ stakes } XP points.`)
                    .addField('Level increased to: ', `${ rank.level }`)
                    .addField('XP increased to: ', `${ rank.xp }`)
                    .addField('Total XP needed to level up:', `${ nextLevel }`)
                    .addField('Haus Coins: ', `🪙 ${ rank.XPoverTime }`)

                message.channel.send({ embeds: [embed] })

                //just gain xp
            } else {
                client.leveling.addXP(user, guild, stakes)
                rank = await client.leveling.getUserLevel(user, guild)
                const embed = new Discord.MessageEmbed()
                    .setThumbnail(player.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))

                    .setTitle('Winner!')
                    .setDescription(`${ message.author.username } rolled a ${ dice[playerDiceRoll - 1] } ${ playerDiceRoll } and I rolled a ${ dice[botDiceRoll - 1] } ${ botDiceRoll }.  ${ message.author.username } won ${ stakes } XP points.`)
                    .addField('Level remained the same: ', `${ rank.level }`)
                    .addField('XP increased to: ', `${ rank.xp }`)
                    .addField('Total XP needed to level up:', `${ curLevelUp }`)
                    .addField('Haus Coins: ', `🪙 ${ rank.XPoverTime }`)

                message.channel.send({ embeds: [embed] })

            }


        } else if (playerDiceRoll < botDiceRoll) {

            let rank = await client.leveling.getUserLevel(user, guild)
            let curLevel = await db.get(`${ user }-${ guild }.nextLevel`)
            //reset back to level 1 with 1 xp
            if (rank.level === 1 && rank.xp < stakes) {
                client.leveling.setXP(1, user, guild)
                rank = await client.leveling.getUserLevel(user, guild)
                const embed = new Discord.MessageEmbed()
                    .setThumbnail(player.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))

                    .setTitle('Sorry, Try Again :[')
                    .setDescription(`${ message.author.username } rolled a ${ dice[playerDiceRoll - 1] } ${ playerDiceRoll } and I rolled a ${ dice[botDiceRoll - 1] } ${ botDiceRoll }.  ${ message.author.username } lost ${ stakes } XP points.`)
                    .addField('Level remained the same: ', `${ rank.level }`)
                    .addField('XP decreased to: ', `${ rank.xp }`)
                    .addField('Total XP needed to level up:', `${ curLevel }`)
                    .addField('Haus Coins: ', `🪙 ${ rank.XPoverTime }`)

                message.channel.send({ embeds: [embed] })

                return
            }

            //go down a level and lose xp
            if (rank.xp < stakes) {
                let negativeNumber = rank.xp - stakes;
                client.leveling.reduceLevels(user, guild, 1)

                rank = await client.leveling.getUserLevel(user, guild)
                const nextLevel = 10 * (Math.pow(2, rank.level) - 1)
                await db.set(`${ user }-${ guild }.nextLevel`, nextLevel)
                let total = nextLevel + negativeNumber;
                if (total === 0) {
                    total = 1;
                }
                client.leveling.setXP(total, user, guild)
                rank = await client.leveling.getUserLevel(user, guild)
                const embed = new Discord.MessageEmbed()
                    .setThumbnail(player.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))

                    .setTitle('Sorry, Try Again. LEVEL LOST!')
                    .setDescription(`${ message.author.username } rolled a ${ dice[playerDiceRoll - 1] } ${ playerDiceRoll } and I rolled a ${ dice[botDiceRoll - 1] } ${ botDiceRoll }..  ${ message.author.username } lost ${ stakes } XP points.`)
                    .addField('Level decreased to: ', `${ rank.level }`)
                    .addField('XP decreased to: ', `${ rank.xp }`)
                    .addField('Total XP needed to level up:', `${ nextLevel }`)
                    .addField('Haus Coins: ', `🪙 ${ rank.XPoverTime }`)

                message.channel.send({ embeds: [embed] })


                //lose level and xp
            } else if (rank.xp === stakes) {
                client.leveling.reduceLevels(user, guild, 1)

                rank = await client.leveling.getUserLevel(user, guild)
                const nextLevel = 10 * (Math.pow(2, rank.level) - 1)
                await db.set(`${ user }-${ guild }.nextLevel`, nextLevel)

                client.leveling.setXP(nextLevel, user, guild)
                rank = await client.leveling.getUserLevel(user, guild)
                const embed = new Discord.MessageEmbed()
                    .setThumbnail(player.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))

                    .setTitle('Sorry, Try Again. LEVEL LOST!')
                    .setDescription(`${ message.author.username } rolled a ${ dice[playerDiceRoll - 1] } ${ playerDiceRoll } and I rolled a ${ dice[botDiceRoll - 1] } ${ botDiceRoll }..  ${ message.author.username } lost ${ stakes } XP points.`)
                    .addField('Level decreased to: ', `${ rank.level }`)
                    .addField('XP decreased to: ', `${ rank.xp }`)
                    .addField('Total XP needed to level up:', `${ nextLevel }`)
                    .addField('Haus Coins: ', `🪙 ${ rank.XPoverTime }`)

                message.channel.send({ embeds: [embed] })
                //just lose xp
            } else {
                client.leveling.reduceXP(user, guild, stakes)
                rank = await client.leveling.getUserLevel(user, guild)
                const embed = new Discord.MessageEmbed()
                    .setThumbnail(player.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))

                    .setTitle('Sorry, Try Again.')
                    .setDescription(`${ message.author.username } rolled a ${ dice[playerDiceRoll - 1] } ${ playerDiceRoll } and I rolled a ${ dice[botDiceRoll - 1] } ${ botDiceRoll }.  ${ message.author.username } lost ${ stakes } XP points.`)
                    .addField('Level remained the same: ', `${ rank.level }`)
                    .addField('XP decreased to: ', `${ rank.xp }`)
                    .addField('Total XP needed to level up:', `${ curLevel }`)
                    .addField('Haus Coins: ', `🪙 ${ rank.XPoverTime }`)

                message.channel.send({ embeds: [embed] })


            }
            //tie
        } else {
            let curLevelUp = await db.get(`${ user }-${ guild }.nextLevel`)
            rank = await client.leveling.getUserLevel(user, guild)
            const embed = new Discord.MessageEmbed()
                .setThumbnail(player.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))

                .setTitle('TIE GAME')
                .setDescription(`${ message.author.username } rolled a ${ dice[playerDiceRoll - 1] } ${ playerDiceRoll } and I rolled a ${ dice[botDiceRoll - 1] } ${ botDiceRoll }.  `)
                .addField('Level remained the same: ', `${ rank.level }`)
                .addField('XP remained the same: ', `${ rank.xp }`)
                .addField('Total XP needed to level up:', `${ curLevelUp }`)
                .addField('Haus Coins: ', `🪙 ${ rank.XPoverTime }`)

            message.channel.send({ embeds: [embed] })


        }

        // new timestamp
        await db.set(`${ user }-${ guild }.timestamp`, timestamp)

    }
}
