const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log('Archivo recibido:', file);
    cb(null, true);
  }
});

module.exports = upload;