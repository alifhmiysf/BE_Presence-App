const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const db = require('./config/database')

const app = express()
const port = 3001

app.use(bodyParser.json())
app.use(cors())

app.get('/', (req,res) => {
    res.send('Hello EXPRESS')
})


app.post('/presence', (req, res) =>  {
    const {user_id} = req.body
    const date = new Date().toISOString().split('T')[0]
    const presenceData  = { user_id, date}

    db.query('INSERT INTO presence SET ?', presenceData, (err, result) => {
        if (err) {
            console.error('Error recording presence:', err)
            return res.status(500).send('Error recording presence')
        }
        res.status(201).send('Presence recorded successfully')
    })
})  


app.listen(port, () => {
    console.log(`server is running on http://localhost:${port}`)
})