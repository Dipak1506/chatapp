const connection = require("./database");

const router = require("express").Router();



router.post('/', (req, res) => {
    const { userId, senderId } = req.body;
    
    const updateQuery = `
        UPDATE messages
        SET is_read = TRUE
        WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE
    `;

    connection.query(updateQuery, [senderId, userId], (err, result) => {
        if (err) {
            console.log(err);
            res.send({ status: 201, message: "Error marking messages as read" });
        } else {
            res.send({ status: 200, message: "Messages marked as read" });
        }
    });
});

module.exports = router;