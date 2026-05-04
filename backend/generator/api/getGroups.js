const connection = require('./database');

const router = require('express').Router();

router.get('/', async (req, res) => {

    try {
      let selectQuery = "select * from groups";

      connection.query(selectQuery,(err,result) => {
        if (err) {
            res.send({ status: 201, msg: "Error fetching user groups" });
            } else {
                res.send({ status: 200, data: result.rows });
            }
      })
    } catch (error) {
      res.send({ status: "error" });
    }
  });

  module.exports = router;
  
  
  