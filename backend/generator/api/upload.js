const express = require('express');
const router = express.Router();
const connection = require("./database")
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage: storage });

router.post('/', upload.single('image') , (req, res) => {
    const file = req.file;
  if (file) {
    const imageUrl = `/uploads/${file.filename}`;
    res.status(200).json({ message: 'File uploaded successfully', imageUrl });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
})

module.exports = router;