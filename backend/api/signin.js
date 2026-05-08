var express = require('express');
var router = express.Router();
const connection = require("./database");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const secretKey = process.env.JWT_SECRETKEY;


router.post("/", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ status: 400, msg: "Username and password required" });
    }

    const selectQuery = "SELECT id, username, password FROM userdata WHERE username = $1";

    try {
        connection.query(selectQuery, [username], async (err, rows) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ status: 500, msg: "Database error" });
            }

            if (rows.rowCount === 0) {
                return res.json({ status: 201, msg: "Invalid username or password" });
            }

            const user = rows.rows[0];
            const match = await bcrypt.compare(password, user.password);

            if (match) {
                const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
                res.json({ status: 200, msg: "Successfully LoggedIn", token, data: [user] });
            } else {
                res.json({ status: 201, msg: "Invalid username or password" });
            }
        });
    } catch (error) {
        res.status(500).json({ status: "error" });
    }
});

module.exports = router;