const { breads } = require('../resources/breads')
const { ids } = require('../resources/id')

const { dairy } = require('../resources/dairy')
const fs = require('fs')

// for (let i = 0; i < 20; i++) {
//     console.log("level: " + i + " requires this much " + (10 * (Math.pow(2, i) - 1)) + "xp to level up to next level")

// }

// const diceRoll = Math.ceil((Math.random() * 6))

// console.log(diceRoll)

function addIDs(array, idArray) {
    for (let i = 0; i <= array.length - 1; i++) {
        array[i].dairyId = idArray[i]

    }
    return array
}



// const content = JSON.stringify(addIDs(dairy, ids))

// fs.writeFile('C:\\Users\\Stephen\\Documents\\codingProjects\\diceBot\\resources\\dairywithID.json', content, err => {
//     if (err) {
//         console.error(err)
//         return
//     }

// })

// console.log(dairy.length)