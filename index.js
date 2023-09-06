// Get express and body parser
const express = require('express'),
  app = express(),
  bodyParser = require('body-parser');

// Load environment variables
require('dotenv').config()

// configure app to use bodyParser()
app.use(bodyParser.json());
const load = require('./src/process/ingest')
const ask = require('./src/process/ask');
const port = 3000 | process.env.PORT

// POST method route for loading a file
app.post('/load', async (req, res) => {
  const loadFile = await load.load(req.body);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(loadFile));
})
// POST method route for loading a file
app.post('/ask', async (req, res) => {
  const askResponse = await ask.ask(req.body);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(askResponse));
})

app.listen(port, () => {
  console.log(`answerPDF running on http://localhost:${port}`)
})