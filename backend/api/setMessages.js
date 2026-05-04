const express = require('express');
const connection = require('./database');
const router = express.Router();


router.post('/', (req,res) => {

    const { sender_id, receiver_id, room_id, messages, is_read } = req.body;
    
    try{
        let insertQuery = "insert into messages ( sender_id, receiver_id, room_id, messages, is_read) values($1, $2, $3, $4,$5) RETURNING message_time";

     
        connection.query(insertQuery,[sender_id,receiver_id,room_id,messages, is_read],(err,result) => {
            if(err){
                res.send({status: 201, msg: err})
            }       
            else{
                res.send({ status: 200, message_time: result.rows[0].message_time })
            }
        })
    }
    catch(err){
        console.log(err);
    }
})

module.exports = router;