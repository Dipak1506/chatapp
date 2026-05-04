const connection = require('./database');

const router = require('express').Router();


router.get('/', async (req, res) => {
    const room_id = req.query.room_id;
    const new_group_name = req.query.new_group_name;
    console.log("roomid :", room_id, "room naME :", new_group_name);
    
    try {
        let updateQuery = "UPDATE groups SET group_name = $1 WHERE room_id = $2";

        connection.query(updateQuery, [new_group_name, room_id], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send({ status: 500, error: 'Database error' });
            } else {
                res.send({ status: 200, data: result });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: 500, error: 'Server error' });
    }
});

module.exports = router;