// const express = require('express');
// const connection = require('./database');
// const router = express.Router();


// router.get('/', (req, res) => {

//     const { userId, selectedUserId } = req.query;

//     let selectQuery = "SELECT * FROM messages  WHERE (sender_id = $1 AND receiver_id = $2)  OR (sender_id = $2 AND receiver_id = $1)";

//     connection.query(selectQuery, [userId, selectedUserId], (err, data) => {
//         if (err) {
//             console.log(err);
//             res.send({ status: 201, message: "Error getting messages" });
//         } else {
//             res.send({ status: 200, data: data.rows });
//         }
//     });
// });

// module.exports = router;

const express = require('express');
const connection = require('./database');
const router = express.Router();

router.get('/', (req, res) => {
    const { userId, selectedUserId, isgroup, roomId } = req.query;

    let selectQuery, params;

    if (isgroup === 'true' && roomId) {
        // ── Group chat ──────────────────────────────────────────────────────────
        // Fetch every message that belongs to this room, regardless of who sent it.
        // This avoids the bleed where receiver_id = room_id is confused with a DM
        // user whose id happens to equal that room number.
        selectQuery = `
            SELECT * FROM messages
            WHERE room_id = $1
            ORDER BY message_time ASC
        `;
        params = [roomId];
    } else {
        // ── Direct message ──────────────────────────────────────────────────────
        // Keep the existing bidirectional sender/receiver query for DMs only.
        selectQuery = `
            SELECT * FROM messages
            WHERE (sender_id = $1 AND receiver_id = $2)
               OR (sender_id = $2 AND receiver_id = $1)
            ORDER BY message_time ASC
        `;
        params = [userId, selectedUserId];
    }

    connection.query(selectQuery, params, (err, data) => {
        if (err) {
            console.log(err);
            res.send({ status: 201, message: "Error getting messages" });
        } else {
            res.send({ status: 200, data: data.rows });
        }
    });
});

module.exports = router;