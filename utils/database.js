// exporting mysql2
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

// create the connection to database
const pool = mysql.createPool({
    host: process.env.host,
    user: process.env.user,
    database: process.env.database,
    password: process.env.password
});


module.exports = pool.promise();