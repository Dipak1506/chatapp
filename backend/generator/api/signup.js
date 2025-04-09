const express = require('express');
const router = express.Router();
const connection = require('./database');
// router.use(express.json);

router.get("/", async (req, res) => {
  //  console.log("Enter");
    const name = req.query.name;
    const email = req.query.email;
    const number = req.query.number;
    const password = req.query.password;
    const username = req.query.username;

   // console.log("name = " + name, "email = " + email, "number = " + number, "password = " + password + "username =" + username);


    try {
        let insertQuery = "insert into userdata(name, email, contactno, password, username) values('" + name + "','" + email + "','" + number + "','" + password + "','" + username +"')"
        connection.query(insertQuery, (err, result) => {
            if (!err) {
                res.send('Insertion was successful')
            }
            else {
                res.send('error');
                //console.log("error");
            }
        })
    }
    catch (error) {
        res.send({ status: "error" });
    };
})

module.exports = router;