
const express = require('express');
const connection = require('./database');
const router = express.Router();

router.get('/', (req, res) => {
    const { userId, selectedUserId, isgroup, roomId } = req.query;

    let selectQuery, params;

    if (isgroup === 'true' && roomId) {
        // ── Group chat ─────────────────────────────────────────────────────────
        selectQuery = `
            SELECT * FROM messages
            WHERE room_id = $1
            ORDER BY message_time ASC
        `;
        params = [roomId];
    } else {
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
