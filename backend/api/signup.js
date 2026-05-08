const express = require('express');
const router = express.Router();
const connection = require('./database');
const bcrypt = require('bcrypt');

router.post("/", async (req, res) => {
    const { name, email, number, password, username } = req.body;

    if (!name || !email || !number || !password || !username) {
        return res.status(400).send({ status: 400, msg: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const insertQuery = "INSERT INTO userdata(name, email, contactno, password, username) VALUES($1,$2,$3,$4,$5)";
        connection.query(insertQuery, [name, email, number, hashedPassword, username], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ status: 500, msg: "Username or email already exists" });
            }
            res.send({ status: 200, msg: "Successfully registered" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: 500, msg: "Server error" });
    }
});

module.exports = router;