const express = require('express');
const axios = require('axios');
const router = express.Router();
const User = require('../models/user'); // User 모델 가져오기

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth/github/callback';

router.get('/', (req, res) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=read:user`;
  res.redirect(url);
});

router.get('/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const response = await axios.post('https://github.com/login/oauth/access_token', null, {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      headers: {
        accept: 'application/json',
      },
    });

    const { access_token } = response.data;
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${access_token}`,
      },
    });

    const username = userResponse.data.login;
    const profile = userResponse.data.avatar_url;

    const user = new User({
      username: username,
      profile: profile,
    });

    await user.save(); // 사용자 정보를 저장합니다.
    console.log('User saved to database');
    res.json(userResponse.data); // 응답을 보냅니다.

  } catch (e) {
    console.error('Error fetching access token or user data:', e.message);
    res.status(500).send('Authentication failed');
  }
});

module.exports = router;
