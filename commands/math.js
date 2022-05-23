const { breads } = require('../resources/breads')
const { ids } = require('../resources/id')
const fs = require('fs')

// for (let i = 0; i < 20; i++) {
//     console.log("level: " + i + " requires this much " + (10 * (Math.pow(2, i) - 1)) + "xp to level up to next level")

// }

// const diceRoll = Math.ceil((Math.random() * 6))

// console.log(diceRoll)

function displayBread() {
    for (let i = 0; i <= breads.length - 1; i++) {
        breads[i].breadId = ids[i]

    }
    return breads
}



const content = JSON.stringify(displayBread())

// fs.writeFile('/home/snapdeus/Documents/codingProjects/diceBot/resources/updatedBread.js', content, err => {
//     if (err) {
//         console.error(err)
//         return
//     }

// })

// displayBread()