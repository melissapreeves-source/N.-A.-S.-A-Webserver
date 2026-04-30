const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '90000000000mb' }));

// In-memory storage (note: this won't persist between function invocations on Vercel)
let codeQueue = [];
let gameReports = {};

// Main page
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>NASA Webserver</title>
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
  <h1>NASA Webserver Operational</h1>
</body>
</html>`);
});

// Modified /send endpoint to accept and store the 'convert' flag
app.post('/send', (req, res) => {
  const { username, code, convert } = req.body;
  
  // Validate required fields
  if (typeof username !== 'string' || typeof code !== 'string') {
    return res.status(400).send('Invalid or missing username/code');
  }
  
  // Store with convert flag (default to false if not provided)
  const convertFlag = (convert === true || convert === 'true');
  
  codeQueue.push({ 
    username, 
    code, 
    convert: convertFlag 
  });
  
  console.log(`[QUEUE] Stored code for ${username} | Convert: ${convertFlag} | Queue size: ${codeQueue.length}`);
  res.status(200).send('Code received with convert support');
});

// Modified /fetch endpoint to return the 'convert' flag
app.get('/fetch/:username', (req, res) => {
  const user = req.params.username;
  const index = codeQueue.findIndex(entry => entry.username === user);
  
  if (index !== -1) {
    const entry = codeQueue.splice(index, 1)[0];
    console.log(`[FETCH] Returning code for ${user} | Convert: ${entry.convert} | Queue size: ${codeQueue.length}`);
    return res.status(200).json({
      username: entry.username,
      code: entry.code,
      convert: entry.convert
    });
  }
  
  console.log(`[FETCH] No code found for ${user}`);
  res.status(204).send();
});

// Debug endpoint to check queue status
app.get('/queue/status', (req, res) => {
  const queueStatus = codeQueue.map(entry => ({
    username: entry.username,
    convert: entry.convert,
    codeLength: entry.code.length
  }));
  res.status(200).json({
    queueSize: codeQueue.length,
    queue: queueStatus,
    reports: gameReports
  });
});

// Endpoint to report game name
app.post('/report', (req, res) => {
  const { username, gameName } = req.body;
  if (typeof username !== 'string' || typeof gameName !== 'string') {
    return res.status(400).send('Invalid or missing username/gameName');
  }
  gameReports[username] = gameName;
  console.log(`[REPORT] ${username} playing: ${gameName}`);
  res.status(200).send('Game name received');
});

// Endpoint to get reported game name
app.get('/report/:username', (req, res) => {
  const gameName = gameReports[req.params.username];
  if (gameName) {
    console.log(`[REPORT GET] Found game for ${req.params.username}: ${gameName}`);
    return res.status(200).send(gameName);
  }
  console.log(`[REPORT GET] No game found for ${req.params.username}`);
  res.status(404).send('No game name reported');
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Export for Vercel (NO app.listen() here!)
module.exports = app;
