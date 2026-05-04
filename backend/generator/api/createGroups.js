// const express = require('express');
// const router = express.Router();
// const connection = require("./database");

// router.get('/', async (req, res) => {
//     const room_id = req.query.room_id;
//     const members = req.query.members;
//     const group_name = req.query.group_name;

//     try {
//         let insertQuery = "insert into groups (room_id, members, group_name) values ($1,$2,$3)";

//         connection.query(insertQuery,[room_id,members,group_name],(err,result) => {
//             if (err) {
//                 console.error(err);
//             }
//             else{
//                 res.send({status: 200, data: result})
//             }
//         })
//     } catch (error) {
//         console.error(error);
//     }
   
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const connection = require("./database");

router.get('/', async (req, res) => {
    const room_id = req.query.room_id;
    const group_name = req.query.group_name;

   
    let members = req.query.members;

    
    try {
        JSON.parse(members);
    } catch (e) {
        return res.status(400).send({ status: 400, msg: "Invalid members format" });
    }

    try {
        const insertQuery = "INSERT INTO groups (room_id, members, group_name) VALUES ($1, $2, $3)";

        connection.query(insertQuery, [room_id, members, group_name], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send({ status: 500, msg: "Error creating group" });
            } else {
                res.send({ status: 200, data: result });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: 500, msg: "Server error" });
    }
});

module.exports = router;

