const express = require('express');
const axios = require('axios');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const port = 3000;
const path  = require('path');
app.use(express.json());
app.use(cors()); // Enable CORS middleware
// MongoDB Connection URI
const uri = 'ur url';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Queue to maintain verification status
const verificationQueue = {};

async function initializeMongo() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
  }
}

initializeMongo();

// Initialize API key with a default value if it doesn't exist
async function initializeAPIKey(apiKey) {
  const db = client.db('api');
  const apiKeysCollection = db.collection('apiKeys');
  const existingKey = await apiKeysCollection.findOne({ key: apiKey });
  if (!existingKey) {
    await apiKeysCollection.insertOne({ key: apiKey, count: 170 });
  }
}

// Deduct 1 from the count of the API key
async function deductAPIKey(apiKey) {
  const db = client.db('api');
  const apiKeysCollection = db.collection('apiKeys');
  await apiKeysCollection.updateOne({ key: apiKey }, { $inc: { count: -1 } });
}


  
  // Endpoint to verify Discord
app.post('/solve', async (req, res) => {
const { apiKey, uid, proxy } = req.body;

try {
    await initializeAPIKey(apiKey); // Ensure API key exists in the database

    // Check if UID already exists in the queue
    if (verificationQueue[uid]) {
    // If UID exists, send an error response
    return res.status(400).json({ error: 'UID already in queue' });
    }

    // If UID doesn't exist, initiate verification process
    const discordUrl = `https://verify.poketwo.net/captcha/${uid}`;
    let payload = {
    cmd: 'request.get',
    url: discordUrl,
    automaticallySolveCaptchas: true,
    alwaysLoad: ['recaptcha']
    };

    if (proxy) {
    payload.proxy = proxy;
    }

    // Update queue with processing status
    verificationQueue[uid] = 'processing';
    // Perform verification
    const startTime = Date.now(); // Record the start time when the request is received
    const response = await axios.post(`https://publisher.scrappey.com/api/v1?key=${apiKey}`, payload);
    const endTime = Date.now(); // Record the end time when the response is received
    const timeTaken = endTime - startTime; // Calculate the time taken
    const solution = response.data.solution.innerText;
    console.log(response.data);
    const isVerified = solution.includes('Thanks for verifying!');
    verificationQueue[uid] = isVerified ? 'true' : 'false';

    // Modify log entry with time taken and success status
    const logEntry = {
    apiKey,
    site: 'verify.poketwo.net',
    proxy,
    uid,
    createdAt: new Date(),
    timeTaken,
    success: isVerified // Add success status to the log entry
    };

    // Store the log entry in MongoDB
    const db = client.db('api');
    const logsCollection = db.collection('requestLogs');
    await logsCollection.insertOne(logEntry);

    await deductAPIKey(apiKey); // Deduct 1 from the count of the API key
    res.json({ status: verificationQueue[uid], timeTaken, proxy, uid, creditsUsed: 1 });
} catch (error) {
    // Update queue with error status
    verificationQueue[uid] = 'error';
    res.status(500).json({ status: verificationQueue[uid], message: error.message });
} finally {
    // Remove UID from queue after verification process is complete
    delete verificationQueue[uid];
}
});

// Endpoint to get the current count of credits for a given API key
app.get('/credits', async (req, res) => {
  const { apiKey } = req.query;

  try {
    const db = client.db('api');
    const apiKeysCollection = db.collection('apiKeys');

    // Find the API key in the database
    const apiKeyDocument = await apiKeysCollection.findOne({ key: apiKey });

    if (!apiKeyDocument) {
      return res.status(404).json({ error: 'API key not found' });
    }

    // Return the current count of credits for the API key
    res.json({ credits: apiKeyDocument.count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to get logs of past requests for a specific API key
app.get('/logs', async (req, res) => {
  const { apiKey } = req.query;

  try {
    // Connect to MongoDB
    const db = client.db('api');
    const logsCollection = db.collection('requestLogs');

    // Find logs for the specified API key
    const logs = await logsCollection.find({ apiKey }).limit(50).toArray();

    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/logger', (req, res) => {
  // Serve the HTML file
  res.sendFile(path.join(__dirname, 'site/index.html'));
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
