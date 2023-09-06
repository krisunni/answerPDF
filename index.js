// Import express and body-parser modules
const express = require('express'), 
      app = express(),
      bodyParser = require('body-parser');

// Load environment variables  
require('dotenv').config();

// Configure express app to use bodyParser middleware
app.use(bodyParser.json());

// Import route handler modules 
const load = require('./src/process/ingest');
const ask = require('./src/process/ask');

// Set port from environment or default
const port = 3000 | process.env.PORT; 

// POST route handler for file loading 
app.post('/load', async (req, res) => {

  // Call ingestion handler 
  const loadFile = await load.load(req.body);
  
  // Set response headers
  res.setHeader('Content-Type', 'application/json');

  // Send back response
  res.end(JSON.stringify(loadFile));

});

// POST route handler for asking questions
app.post('/ask', async (req, res) => {

  // Call ask handler
  const askResponse = await ask.ask(req.body);

  // Set response headers 
  res.setHeader('Content-Type', 'application/json');

  // Send back response
  res.end(JSON.stringify(askResponse));  

});

// Start express server
app.listen(port, () => {
  console.log(`answerPDF running on http://localhost:${port}`)
});