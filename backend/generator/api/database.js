var express = require('express');
var router = express.Router();
const { Client } = require('pg')
const connection = new Client({
    host: "localhost",
    user: "root",
    port: 5432,
    password: "root",
    database: "db",
})

connection.connect(function (e) {
    if (e) console.log(e);
    else console.log("Postgress Database is connected");
})

module.exports = connection;