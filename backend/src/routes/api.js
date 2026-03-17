const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');

router.get('/download', downloadController.downloadMp3);

module.exports = router;
