require('dotenv').config()
postgres = require('postgres')

const sql = postgres({
    host    : process.env.PGHOST,
    port    : process.env.PGPORT,
    database: process.env.PGDATABASE,
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
})

module.exports.sql = sql;