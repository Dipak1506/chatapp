const express = require('express');
const router = express.Router();
const connection = require("./database");

router.get('/', async (req, res) => {
    const room_id = req.query.room_id;
    const members = req.query.members;
    const group_name = req.query.group_name;

    try {
        let insertQuery = "insert into groups (room_id, members, group_name) values ($1,$2,$3)";

        connection.query(insertQuery,[room_id,members,group_name],(err,result) => {
            if (err) {
                console.error(err);
            }
            else{
                res.send({status: 200, data: result})
            }
        })
    } catch (error) {
        console.error(error);
    }
   
});

module.exports = router;
