// routes/index.js
const express = require('express');
const router = express.Router();
const githubAuth = require('../oauth/github');

router.use('/oauth/github', githubAuth);

module.exports = router;
