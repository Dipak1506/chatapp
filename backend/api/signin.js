var express = require('express');
var router = express.Router();
const connection = require("./database");
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { response } = require('../app');
router.use(express.json());



const secretKey = process.env.JWT_SECRETKEY;

router.post("/", async (req, res) => {
  const username = req.query.username;
  const password = req.query.password;

  let selectQuery = "SELECT id, username, password FROM userdata WHERE username = $1 AND password = $2";


  try {
    connection.query(selectQuery, [username, password], (err, rows) => {
      if (err) {
        console.log(err.message);
        res.json({ status: 500, msg: "Database error" });
      } else {
        
        if (rows.rowCount > 0) { 
          const payload = { username: username };
          const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
          res.send({ status: 200, msg: "Successfully LoggedIn", token: token, data: rows.rows});
        } else {
          res.send({ status: 201, msg: "Invalid username or password" });
        }
      }
    });
  }
  catch (error) {
    res.send({ status: "error" });
  };

});

module.exports = router;