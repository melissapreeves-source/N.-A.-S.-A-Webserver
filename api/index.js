const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '900000000000000000000000000000000000000000000000000000000000000000000000000000mb' }));

// In-memory storage (note: this won't persist between function invocations)
let codeQueue = [];
let gameReports = {};

// Main page
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>nasa webserver</title>
  <style>
    body {
      background-color: white;
      color: black;
      font-family: sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
  </style>
</head>
<body>
  <h1>Not For u hehe5he</h1>
</body>
</html>`);
});

// Endpoint to receive code
app.post('/send', (req, res) => {
  const { username, code } = req.body;
  if (typeof username !== 'string' || typeof code !== 'string') {
    return res.status(400).send('Invalid or missing username/code');
  }
  codeQueue.push({ username, code });
  res.status(200).send('Code received');
});

// Endpoint to fetch code for a specific user
app.get('/fetch/:username', (req, res) => {
  const user = req.params.username;
  const index = codeQueue.findIndex(entry => entry.username === user);
  if (index !== -1) {
    const entry = codeQueue.splice(index, 1)[0];
    return res.status(200).json(entry);
  }
  res.status(204).send();
});

// Endpoint to report game name
app.post('/report', (req, res) => {
  const { username, gameName } = req.body;
  if (typeof username !== 'string' || typeof gameName !== 'string') {
    return res.status(400).send('Invalid or missing username/gameName');
  }
  gameReports[username] = gameName;
  res.status(200).send('Game name received');
});

// Endpoint to get reported game name
app.get('/report/:username', (req, res) => {
  const gameName = gameReports[req.params.username];
  if (gameName) {
    return res.status(200).send(gameName);
  }
  res.status(404).send('No game name reported');
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Export for Vercel (NO app.listen() here!)
module.exports = app;
