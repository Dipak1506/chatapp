const connection = require("./database");

const router = require("express").Router();

router.get('/', (req, res) => {
    const { userId } = req.query;

    console.log('lastmsg:', userId);
    

    const selectQuery = `
    SELECT DISTINCT ON (other_user_id) 
        CASE 
            WHEN sender_id = $1 THEN receiver_id 
            ELSE sender_id 
        END AS other_user_id,
        messages,
        message_time,
        CASE 
            WHEN (sender_id = $1 AND is_read = TRUE) OR (receiver_id = $1 AND is_read = TRUE) THEN TRUE
            ELSE FALSE
        END AS is_read,
        (SELECT COUNT(*) FROM messages m2 
        WHERE m2.sender_id = (CASE WHEN m1.sender_id = $1 THEN m1.receiver_id ELSE m1.sender_id END)
        AND m2.receiver_id = $1 AND m2.is_read = FALSE) AS unread_count
    FROM messages m1
    WHERE (sender_id = $1 OR receiver_id = $1)
    ORDER BY other_user_id, message_time DESC
`;

    connection.query(selectQuery, [userId], (err, data) => {
        if (err) {
            console.log(err);
            res.send({ status: 201, message: "Error getting last messages" });
        } else {
            res.send({ status: 200, data: data.rows });
        }
    });
});

module.exports = router;