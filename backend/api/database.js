var express = require('express');
var router = express.Router();
const { Client } = require('pg')
const connection = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

connection.connect(function (e) {
    if (e) console.log(e);
    else console.log("Postgress Database is connected");
})

module.exports = connection;