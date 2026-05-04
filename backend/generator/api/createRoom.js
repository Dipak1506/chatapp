const express = require('express');
const router = express.Router();
const connection = require("./database");

router.get('/', async (req, res) => {
    const room_name = req.query.room_name;
    const isgroup = req.query.isgroup;

    try {
        const selectQuery = "SELECT * FROM rooms WHERE room_name = $1";
        connection.query(selectQuery, [room_name], (err, data) => {
            if (err) {
                res.send({status: 201, msg: "Error checking for room"});
            } else if (data.rows.length > 0) {
                res.send({status: 200, data: data.rows[0]});
            } else {
                const insertQuery = "INSERT INTO rooms (room_name, isgroup) VALUES ($1, $2) RETURNING *";
                connection.query(insertQuery, [room_name, isgroup], (err, data) => {
                    if (err) {
                        res.send({status: 201, msg: "Error inserting room"});
                    } else {
                        res.send({status: 200, data: data.rows[0]});
                    }
                });
            }
        });
    } catch (error) {
        res.send({ status: "error" });
    }
});

module.exports = router;
