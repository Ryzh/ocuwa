const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
// const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const app = express();

// Middleware
// app.use(cors());
app.use(express.json());  // Built-in middleware to handle JSON payloads
app.use(express.urlencoded({ extended: false }));

function extractJson(inputString) {
  try {
    // Find the first opening { and the last closing }
    const startIndex = inputString.indexOf('{');
    const endIndex = inputString.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
      throw new Error('No JSON object found in the string.');
    }

    // Extract the JSON substring
    const jsonString = inputString.substring(startIndex, endIndex + 1);

    // Parse JSON
    const resultMap = JSON.parse(jsonString);

    return resultMap;

  } catch (error) {
    console.error('Failed to extract and parse JSON:', error);
    return null;
  }
}

// Routes
app.get('/test', (req, res) => {
  res.send('Hello from the backend!');
});

app.post('/hello', (req, res) => {
  const receivedMessage = req.body.message || 'world';
  res.json({ message: `hello ${receivedMessage}` });
});

app.post('/generate', async (req, res) => {
  try {
    console.info('/Generate: ' + req.body)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = 'Reply in one sentence.' + req.body || '';
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({ message: text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.json({ message: error });
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

app.post('/marketTrend', async (req, res) => {
  try {
    let body;
    if (Buffer.isBuffer(req.body)) {
      body = JSON.parse(req.body.toString('utf8'));
    } else if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else {
      body = req.body;
    }

    console.info('/marketTrend parsed body: ', body);
    let answer = '';
    if (body.productDescription && body.productDescription !== '' && body.targetMarket && body.targetMarket !== '') {
        const prompt = `Provide the market size of ${body.productDescription} in ${body.targetMarket} in the past 10 years. If no data, find the numbers of the parent category. Reply only in JSON format following the template below: {category: <category name>, datasource: <the source of the data>, info: <any extra information or notes>, data: {20xx: <market size in million AUD in 20xx}, {20yy: <market size in million AUD in 20yy} ...... }`;
        console.info('Generated Prompt: ', prompt);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.info('Generated Response: ', response);

        answer = extractJson(response.text());
    } else {
        answer = { info: {} };
    }

    console.info('Final Answer: ', answer);
    res.json({ message: answer });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});


module.exports.handler = serverless(app);
