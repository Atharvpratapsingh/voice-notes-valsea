// Import the tools we installed earlier
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
console.log('API key loaded, length:', process.env.VALSEA_API_KEY ? process.env.VALSEA_API_KEY.length : 'NOT FOUND');

// Create our server
const app = express();

// Allow our frontend to talk to this backend
app.use(cors());

// Set up multer to handle file uploads, storing them temporarily in memory
const upload = multer({ storage: multer.memoryStorage() });

// This creates one "route" - a URL our frontend can send files to
// POST means "we are sending data", '/transcribe' is the URL path
app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    // req.file contains the audio file that was uploaded
    const audioFile = req.file;

    // Prepare the file to send to VALSEA
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', audioFile.buffer, audioFile.originalname);
    formData.append('model', 'valsea-transcribe');
    formData.append('language', req.body.language || 'english');

    // Send the file to VALSEA's API using axios
    const response = await axios.post(
      'https://api.valsea.ai/v1/audio/transcriptions',
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.VALSEA_API_KEY}`,
          ...formData.getHeaders(),
        },
           maxBodyLength: Infinity,
           maxContentLength: Infinity,
      }
    );

    // Send VALSEA's answer back to our frontend
    res.json(response.data);
  } catch (error) {
    console.log('Error message:', error.message);
    if (error.response) {
      console.log('VALSEA said:', error.response.data);
    }
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Start the server on port 5000
app.listen(5000, () => {
  console.log('Backend server is running on http://localhost:5000');
});