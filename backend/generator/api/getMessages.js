const express = require('express');
const connection = require('./database');
const router = express.Router();


router.get('/', (req,res) => {
   
    const { userId, selectedUserId } = req.query; 

    // console.log("query",req.query);
    
    let selectQuery = "SELECT * FROM messages  WHERE (sender_id = $1 AND receiver_id = $2)  OR (sender_id = $2 AND receiver_id = $1)";
    
    connection.query(selectQuery, [userId, selectedUserId], (err, data) => {
        if (err) {
            console.log(err);
            res.send({ status: 201, message: "Error getting messages" });
        } else {
            res.send({ status: 200, data: data.rows });
            // console.log(data);
        }
    });
});

module.exports = router;