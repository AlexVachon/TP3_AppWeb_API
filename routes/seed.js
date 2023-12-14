const express = require('express');
const router = express.Router();
const seedController = require("../controllers/seedController")

router.get('/db/seed', seedController.seed)

module.exports = router