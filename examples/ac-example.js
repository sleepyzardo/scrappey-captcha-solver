const { Client } = require('discord.js-selfbot-v13');
const axios = require('axios');

const apiUrl = 'http://45.140.188.54:6200/solve';
const apiKey = 'your api key';
const uid = '123456789';
const proxy = ''; // Can be left empty
let verifying = false;
const wl = ['']; // Array of guild IDs to whitelist

const client = new Client();

client.on('ready', async () => {
    console.log(`Connected to ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (
        message.author.id === '716390085896962058' && // Replace with the desired user ID
        message.content.includes('human') && // Check if message includes 'human'
        !verifying && // Check if not already verifying
        wl.includes(message.guild.id) // Check if message is sent in a whitelisted guild
    ) {
        verifying = true; // Set verifying to true to prevent multiple verifications
        const payload = {
            apiKey: apiKey,
            uid: uid,
            proxy: proxy
        };

        try {
            const response = await axios.post(apiUrl, payload);
            console.log('Response:', response.data);
        } catch (error) {
            console.error('Error:', error.message);
        } finally {
            verifying = false; // Reset verifying after the request is complete
        }
    }
});

client.login('YOUR_DISCORD_TOKEN');
