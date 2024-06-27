const axios = require('axios');

const apiUrl = 'http://localhost:3000/solve';
const apiKey = 'your api key';
const uid = '123456789';
const proxy = 'can be left empty';

const payload = {
  apiKey: apiKey,
  uid: uid
};

axios.post(apiUrl, payload)
  .then(response => {
    console.log('Response:', response.data);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
