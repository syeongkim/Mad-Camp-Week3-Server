// server.js
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT;
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const MONGO_URI = process.env.MONGO_URI;
const REDIRECT_URI = 'http://localhost:3000/oauth/github/callback';

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Successfully connected to mongodb'))
  .catch(e => console.error(e));

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
