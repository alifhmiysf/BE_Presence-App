const mysql = require('mysql2')
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'',
    database: 'presence_db'
})

connection.connect((err) => {
    if(err) throw err
    console.log('Connected to the Mysql server')
})

module.exports = connection