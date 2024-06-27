const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3000;
const path = require('path');
app.use(express.json());
app.use(cors()); // Enable CORS middleware

// Queue to maintain verification status
const verificationQueue = {};

// Endpoint to verify Discord
app.post('/solve', async (req, res) => {
    const { apiKey, uid, proxy } = req.body;

    try {
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



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
