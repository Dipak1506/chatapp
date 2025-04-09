const express = require('express');
const connection = require('./database');
const router = express.Router();


router.get('/', (req,res) => {
    const sender_id = req.query.sender_id;
    const receiver_id = req.query.receiver_id;
    const room_id = req.query.room_id;
    const messages = req.query.messages;
    const is_read = req.query.isread;

    
    try{
        let insertQuery = "insert into messages ( sender_id, receiver_id, room_id, messages, is_read) values($1, $2, $3, $4,$5)";

     
        connection.query(insertQuery,[sender_id,receiver_id,room_id,messages, is_read],(err,result) => {
            if(err){
                // console.log(err);
                res.send({status: 201, msg: err})
            }       
            else{
                res.send({status: 200})
            }
        })
    }
    catch(err){
        console.log(err);
    }
})

module.exports = router;