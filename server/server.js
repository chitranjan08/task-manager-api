const express = require('express');

const app = express();

// Basic route to test server
app.get('/', (req, res) => {
  res.send('Hello Chitranjan!');
});

module.exports = app;
