const db = require('quick.db')
const { EventEmitter } = require("events")
const events = require('./events/events.js')
const deleteModule = require('./deletedb.js')
const fs = require('fs')

class EasyLeveling extends EventEmitter {
    /**
     * Create a new Discord Easy Level
     * @param {any} client Your Discord.js Client
     * @param {object} options Discord XP level options
     */
    constructor (client, options) {
        super()
        if (!client) throw new Error('Easy Leveling Error: A valid discord client must be provided')
        if (!options) throw new Error('Easy Leveling Error: Options must be defined. Consinder reading readme.md')
        if (typeof options != 'object') throw new Error('Easy Leveling Error: Typeof options must be an object')
        // if(!options.startingXP || !options.startingLevel || !options.levelUpXP || !options.database) throw new Error('Easy Leveling Error: starting XP, starting Level or level up XP must be defined')
        this.client = client
        this.startingXP = options.startingXP || 1
        this.startingLevel = options.startingLevel || 1
        this.levelUpXP = options.levelUpXP || 100
        this.cooldown = options.cooldown || 5000
        this.diceCooldown = options.diceCooldown || 5000
        this.db = db
    }
    /**
     * add level to your desire user
     * @param {string} userId The id of the user you want to add levels
     * @param {string} guildId The id of the guild that the user is in
     */
    async addLevels(userId, guildId, channelId, timestamp, username, author) {
        if (!userId) throw new Error('Easy Leveling Error: A valid user id must be provided')
        if (!guildId) throw new Error('Easy Level Error: A valid guild id must be provided')
        if (!channelId) throw new Error('Easy Level Error: A valid channel id must be provided')

        try {
            const dbHasLevel = this.db.has(`${ userId }-${ guildId }`)
            if (!dbHasLevel) {
                this.db.set(`${ userId }-${ guildId }`, { XP: this.startingXP })
                this.db.set(`${ userId }-${ guildId }.level`, this.startingLevel)
                this.db.set(`${ userId }-${ guildId }.userId`, userId)
                this.db.set(`${ userId }-${ guildId }.XPoverTime`, 1)
                this.db.set(`${ userId }-${ guildId }.username`, username)
                this.db.set(`${ userId }-${ guildId }.nextLevel`, this.levelUpXP)
                return
            }
            const userLevelUp = await this.db.get(`${ userId }-${ guildId }.XP`)
            const curLevelUp = await this.db.get(`${ userId }-${ guildId }.nextLevel`)
            if (userLevelUp === curLevelUp || userLevelUp > curLevelUp) {
                await this.db.set(`${ userId }-${ guildId }.XP`, 1)
                const userHasLevel = this.db.has(`${ userId }-${ guildId }.level`)
                if (!userHasLevel) return await this.db.set(`${ userId }-${ guildId }.level`, 1)

                await this.db.add(`${ userId }-${ guildId }.level`, 1)
                const newLevel = this.db.get(`${ userId }-${ guildId }.level`)

                const nextLevel = this.levelUpXP * (Math.pow(2, newLevel) - 1)
                await this.db.set(`${ userId }-${ guildId }.nextLevel`, nextLevel)
                const lastLevel = newLevel - 1
                this.emit(events.UserLevelUpEvent, newLevel, lastLevel, userId, guildId, channelId, username, author)
                return
            }
            //cooldown
            const lastMessage = await this.db.get(`${ userId }-${ guildId }.timestamp`)
            if (lastMessage !== null && this.cooldown - (Date.now() - lastMessage) > 0) {
                console.log('cooldown active')
                this.emit(events.cooldownActive, channelId, userId)
            }
            //add xp, new timestamp
            await this.db.set(`${ userId }-${ guildId }.timestamp`, timestamp)
            this.db.add(`${ userId }-${ guildId }.XP`, 1)
            this.db.add(`${ userId }-${ guildId }.XPoverTime`, 1)
        } catch (error) {
            this.emit(events.error, error, 'addLevels')
        }
    }
    /**
     * get the level and xp of the user
     * @param {string} userId user id
     * @param {string} guildId guild id
     * @returns {object} XP and the level of the user
     */
    async getUserLevel(userId, guildId, username) {
        if (!userId) throw new Error('Easy Level Error: A valid user id must be provided')
        if (!guildId) throw new Error('Easy Level Error: A valid guild id must be provided')
        try {
            const dbHasLevel = this.db.has(`${ userId }-${ guildId }`)
            if (!dbHasLevel) {
                this.db.set(`${ userId }-${ guildId }`, { XP: this.startingXP })
                this.db.set(`${ userId }-${ guildId }.level`, this.startingLevel)
                this.db.set(`${ userId }-${ guildId }.userId`, userId)
                this.db.set(`${ userId }-${ guildId }.XPoverTime`, 1)
                this.db.set(`${ userId }-${ guildId }.username`, username)
                this.db.set(`${ userId }-${ guildId }.nextLevel`, this.levelUpXP)

            }
            const level = await this.db.get(`${ userId }-${ guildId }.level`)
            const xp = await this.db.get(`${ userId }-${ guildId }.XP`)
            const nextLevel = await this.db.get(`${ userId }-${ guildId }.nextLevel`)
            const XPoverTime = await this.db.get(`${ userId }-${ guildId }.XPoverTime`)
            const data = {
                level: level,
                xp: xp,
                nextLevel: nextLevel,
                XPoverTime: XPoverTime
            }
            return data
        } catch (error) {
            this.emit(events.error, error, 'getUserLevel')
        }
    }


    /**
     * force set the level of a user
     * @param {number} level 
     * @param {string} userId 
     * @param {string} guildId 
     */
    async setLevel(level, userId, guildId) {
        if (!level) throw new Error('Easy Level Error: A valid level must be provided')
        if (typeof level != "number") throw new SyntaxError('Easy Level Error: Type of level must be a number')
        if (!userId) throw new Error('Easy Level Error: A valid user id must be provided')
        if (!guildId) throw new Error('Easy Level Error: A valid guild id must be provided')
        try {
            await this.db.set(`${ userId }-${ guildId }.level`, level)
        } catch (error) {
            this.emit(events.error, error, 'setLevel')
        }
    }
    /**
     * force set the xp of a user
     * @param {string} xp 
     * @param {string} userId 
     * @param {string} guildId 
     */
    async setXP(xp, userId, guildId) {
        const curLevelUp = await this.db.get(`${ userId }-${ guildId }.nextLevel`)
        if (!xp) throw new Error('Easy Level Error: A valid xp must be provided')
        if (typeof xp != 'number') throw new SyntaxError('Easy Level Error: Type of xp must be a number')
        if (xp > curLevelUp) throw new Error(`Easy Level Error: Amount of XP cannot be more than ${ curLevelUp }`)
        // if (xp < 0) throw new Error(`Easy Level Error: Amount of XP cannot be more than 0`)
        try {
            await this.db.set(`${ userId }-${ guildId }.XP`, xp)
        } catch (error) {
            this.emit(events.error, error, 'setXP')
        }
    }
    /**
     * get all data from the database. powered by quick.db
     * @returns {string} 
     */
    async getAllData() {
        try {
            const allData = this.db.all()
            return allData
        } catch (error) {
            this.emit(events.error, error, 'getAllData')
        }
    }
    async deleteAllData() {
        deleteModule.deleteAllData(this.db, this.dbName)
    }
    /**
     * will delete a user's data from the database
     * @param {string} userId the id of the user you want to delete
     * @param {string} guildId the id of the guild you want the data deleted from
     */
    async deleteUserData(userId, guildId) {
        if (!userId) throw new Error('Easy Level Error: A valid user id must be provided!')
        if (!guildId) throw new Error('Easy Level Error: A valid user guild must be provided!')
        try {
            deleteModule.deleteUserData(userId, guildId, this.db)
        } catch (err) {
            this.emit(events.error, error, 'deleteUserData')
        }
    }

    async addOneLevel(userId, guildId, amount) {
        if (!userId) throw new Error('Easy Level Error: A valid user id must be provided!')
        if (!guildId) throw new Error('Easy Level Error: A valid user guild must be provided!')
        if (!amount) throw new Error('Easy Level Error: An amount must be provided!')
        if (typeof amount != 'number') throw new Error("Easy Level TypeError: Type of 'amount' must be a number")
        try {
            // const xpAmount = amount * 100

            this.db.add(`${ userId }-${ guildId }.level`, amount)
            await this.db.set(`${ userId }-${ guildId }.XP`, 1)
        } catch (error) {
            this.emit(events.error, error, 'reduceLevels')
        }
    }
    /**
     * Reduce the amount of level(s) from a user
     * @param {string} userId Id of the user you want to reduce levels from
     * @param {string} guildId Id of the guild you want to reduce Levels from
     * @param {number} amount Amount of levels you want to reduce
     */
    async reduceLevels(userId, guildId, amount) {
        if (!userId) throw new Error('Easy Level Error: A valid user id must be provided!')
        if (!guildId) throw new Error('Easy Level Error: A valid user guild must be provided!')
        if (!amount) throw new Error('Easy Level Error: An amount must be provided!')
        if (typeof amount != 'number') throw new Error("Easy Level TypeError: Type of 'amount' must be a number")
        try {
            const xpAmount = amount * 5;
            this.db.subtract(`${ userId }-${ guildId }.level`, amount)
            this.db.subtract(`${ userId }-${ guildId }.XPoverTime`, xpAmount)
        } catch (error) {
            this.emit(events.error, error, 'reduceLevels')
        }
    }
    /**
     * reduce the amount of xp(s) from a user
     * @param {string} userId Id of the user you want to reduce xp from
     * @param {string} guildId Id of the guild you want to reduce xp from
     * @param {number} amount Amount of xp(s) you want to reduce
     */

    async addXP(userId, guildId, amount) {
        if (!userId) throw new Error('Easy Level Error: A valid user id must be provided!')
        if (!guildId) throw new Error('Easy Level Error: A valid user guild must be provided!')
        if (!amount) throw new Error('Easy Level Error: An amount must be provided!')
        try {
            if (typeof amount != 'number') throw new Error("Easy Level TypeError: Type of 'amount' must be a number")

            this.db.add(`${ userId }-${ guildId }.XPoverTime`, amount)
            this.db.add(`${ userId }-${ guildId }.XP`, amount)
        } catch (error) {
            this.emit(events.error, error, 'addXP')
        }
    }
    async addXPoverTime(userId, guildId, amount) {
        if (!userId) throw new Error('Easy Level Error: A valid user id must be provided!')
        if (!guildId) throw new Error('Easy Level Error: A valid user guild must be provided!')
        if (!amount) throw new Error('Easy Level Error: An amount must be provided!')
        try {
            if (typeof amount != 'number') throw new Error("Easy Level TypeError: Type of 'amount' must be a number")

            this.db.add(`${ userId }-${ guildId }.XPoverTime`, amount)

        } catch (error) {
            this.emit(events.error, error, 'addXPoverTime')
        }
    }
    async reduceXP(userId, guildId, amount) {
        if (!userId) throw new Error('Easy Level Error: A valid user id must be provided!')
        if (!guildId) throw new Error('Easy Level Error: A valid user guild must be provided!')
        if (!amount) throw new Error('Easy Level Error: An amount must be provided!')
        try {
            if (typeof amount != 'number') throw new Error("Easy Level TypeError: Type of 'amount' must be a number")

            this.db.subtract(`${ userId }-${ guildId }.XPoverTime`, amount)
            this.db.subtract(`${ userId }-${ guildId }.XP`, amount)
        } catch (error) {
            this.emit(events.error, error, 'reduceXP')
        }
    }
    async reduceXPoverTime(userId, guildId, amount) {
        if (!userId) throw new Error('Easy Level Error: A valid user id must be provided!')
        if (!guildId) throw new Error('Easy Level Error: A valid user guild must be provided!')
        if (!amount) throw new Error('Easy Level Error: An amount must be provided!')
        try {
            if (typeof amount != 'number') throw new Error("Easy Level TypeError: Type of 'amount' must be a number")

            this.db.subtract(`${ userId }-${ guildId }.XPoverTime`, amount)

        } catch (error) {
            this.emit(events.error, error, 'reduceXP')
        }
    }
    async getTopUser(guildId) {
        if (!guildId) throw new Error('Easy level Error: guildId must be a valid discord guild')


        const allData = await this.db.all()

        const XPforGuild = []
        for (const key of allData) {
            if (String(key.ID).includes(guildId)) {
                XPforGuild.push({
                    xpOverTime: key.data.XPoverTime,
                    userId: key.data.userId,
                    level: key.data.level,
                    xp: key.data.XP,
                    username: key.data.username
                })
            }
        }

        // array.sort((a, b) => { return a.x - b.x || a.y - b.y })
        XPforGuild.sort((a, b) => {
            return b.level - a.level || b.xp - a.xp
        })
        let leaders = []
        for (let i = 0; i < allData.length; i++) {

            leaders.push(XPforGuild[i])

        }
        if (leaders.length > 5) {
            leaders.length = 5;
        }

        return leaders
    }

    async rollDice(userId, guildId, username) {
        if (!userId) throw new Error('Easy Level Error: A valid user id must be provided!')
        if (!guildId) throw new Error('Easy Level Error: A valid user guild must be provided!')
        const dbHasLevel = this.db.has(`${ userId }-${ guildId }`)
        if (!dbHasLevel) {
            this.db.set(`${ userId }-${ guildId }`, { XP: this.startingXP })
            this.db.set(`${ userId }-${ guildId }.level`, this.startingLevel)
            this.db.set(`${ userId }-${ guildId }.userId`, userId)
            this.db.set(`${ userId }-${ guildId }.XPoverTime`, 1)
            this.db.set(`${ userId }-${ guildId }.username`, username)
            this.db.set(`${ userId }-${ guildId }.nextLevel`, this.levelUpXP)

        }

        const playerDiceRoll = Math.ceil((Math.random() * 6))
        const botDiceRoll = Math.ceil((Math.random() * 6))


        return { playerDiceRoll, botDiceRoll }

    }


}
module.exports = EasyLeveling