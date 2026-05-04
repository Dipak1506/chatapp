const express = require('express');
const router = express.Router();
const connection = require('./database');
// router.use(express.json);

router.get("/", async (req, res) => {

    const name = req.query.name;
    const email = req.query.email;
    const number = req.query.number;
    const password = req.query.password;
    const username = req.query.username;

    try {
        let insertQuery = "insert into userdata(name, email, contactno, password, username) values('" + name + "','" + email + "','" + number + "','" + password + "','" + username +"')"
        connection.query(insertQuery, (err, result) => {
            if (!err) {
                res.send('Insertion was successful')
            }
            else {
                res.send('error');
            }
        })
    }
    catch (error) {
        res.send({ status: "error" });
    };
})

module.exports = router;