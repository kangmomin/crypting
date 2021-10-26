const app = require('express').Router()
const mysqli = require('./admin/conn')

app.post('*', async (req, res) => {
    const data = req.body.reply
    
    try {
        const replyData = await addReply(data)
        res.status(201).json({replyData})
    } catch (err) {
        res.status(400).json({err})
    }
})

async function addReply(data) {
    return new Promise((resolve, reject) => {
        mysqli.query("INSERT INTO reply (description) VALUES (?)", [data], (err, data) => {
            if(err) reject(err)
            else resolve(data)
        })
    })
}

module.exports = app