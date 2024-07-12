// server.js
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth/github/callback';

app.get('/oauth/github', (req, res) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=read:user`;
  res.redirect(url);
});

app.get('/oauth/github/callback', async (req, res) => {
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
  
    console.log(response)
    const { access_token } = response.data;
    console.log('access_token', access_token);
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${access_token}`,
      },
    });
  
    res.json(userResponse.data);
  } catch (e) {
    console.error('Error fetching access token or user data:', e.message);
    res.status(500).send('Authentication failed');
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
