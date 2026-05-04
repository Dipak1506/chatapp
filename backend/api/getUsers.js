const express = require('express');
const router = express.Router();
const connection = require("./database")

router.get('/', (req, res) => {
    let selectQuery = "select * from userdata";

    try {
        connection.query(selectQuery, (err, data) => {
            if(err){
                res.send({status: 201, msg: "Error getting users"});
            } else {
                res.send({status: 200, data: data.rows});
            }
        })
    }
    catch (error) {
        res.send({ status: "error" });
    };
})

module.exports = router;